import * as cheerio from "cheerio";
import type { CollectedContact, CollectorResult, WebsiteData } from "./types";
import { extractContactsFromText } from "./instagram";
import { normalizeUrl, extractDomain } from "@/lib/utils";
import { logger } from "@/lib/logger";

const CONTACT_PATHS = [
  "/contact",
  "/contact-us",
  "/contactus",
  "/get-in-touch",
  "/reach-us",
];
const ABOUT_PATHS = ["/about", "/about-us", "/aboutus", "/company"];
const TEAM_PATHS = ["/team", "/our-team", "/people", "/leadership"];

/**
 * Collector B: Website analyzer.
 * Extracts only publicly displayed information from website pages.
 */
export async function collectWebsiteData(
  url: string
): Promise<CollectorResult<WebsiteData>> {
  const contacts: CollectedContact[] = [];
  const errors: string[] = [];

  const normalizedUrl = normalizeUrl(url);
  const domain = extractDomain(normalizedUrl);

  try {
    const homepageResponse = await fetchPublicPage(normalizedUrl);
    if (!homepageResponse) {
      errors.push("Unable to access website homepage");
      return { success: false, data: null, contacts, errors };
    }

    const $ = cheerio.load(homepageResponse.html);
    const title =
      $("title").text().trim() ||
      $('meta[property="og:title"]').attr("content");
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content");

    const footerText = $("footer").text().replace(/\s+/g, " ").trim();
    contacts.push(
      ...extractContactsFromText(footerText, "website_footer", normalizedUrl)
    );

    const schemaData = extractSchemaData($);
    if (schemaData) {
      contacts.push(...extractContactsFromSchema(schemaData, normalizedUrl));
    }

    const [contactPageUrl, aboutPageUrl, teamPageUrl] = await Promise.all([
      discoverPage(normalizedUrl, domain, CONTACT_PATHS, $),
      discoverPage(normalizedUrl, domain, ABOUT_PATHS, $),
      discoverPage(normalizedUrl, domain, TEAM_PATHS, $),
    ]);

    if (contactPageUrl) {
      const contactPage = await fetchPublicPage(contactPageUrl);
      if (contactPage) {
        contacts.push(
          ...extractVisibleContactsFromHtml(
            contactPage.html,
            "contact_page",
            contactPageUrl
          )
        );
      }
    }

    if (aboutPageUrl) {
      const aboutPage = await fetchPublicPage(aboutPageUrl);
      if (aboutPage) {
        contacts.push(
          ...extractVisibleContactsFromHtml(
            aboutPage.html,
            "about_page",
            aboutPageUrl
          )
        );
      }
    }

    if (teamPageUrl) {
      const teamPage = await fetchPublicPage(teamPageUrl);
      if (teamPage) {
        contacts.push(
          ...extractVisibleContactsFromHtml(
            teamPage.html,
            "team_page",
            teamPageUrl
          )
        );
      }
    }

    const data: WebsiteData = {
      url: normalizedUrl,
      title,
      description,
      contactPageUrl: contactPageUrl || undefined,
      aboutPageUrl: aboutPageUrl || undefined,
      teamPageUrl: teamPageUrl || undefined,
      footerText: footerText.slice(0, 5000) || undefined,
      schemaData: schemaData || undefined,
      rawData: { domain },
    };

    logger.info("Website data collected", { url: normalizedUrl });
    return { success: true, data, contacts, errors };
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Website analysis failed"
    );
    logger.error("Website collector failed", error as Error, { url });
    return { success: false, data: null, contacts, errors };
  }
}

async function fetchPublicPage(
  url: string
): Promise<{ html: string; url: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PCIPBot/1.0; +https://pcip.example.com/bot)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });

    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    const html = await response.text();
    return { html, url: response.url };
  } catch {
    return null;
  }
}

async function discoverPage(
  baseUrl: string,
  domain: string,
  paths: string[],
  $: cheerio.CheerioAPI
): Promise<string | null> {
  for (const path of paths) {
    const testUrl = new URL(path, baseUrl).href;
    const page = await fetchPublicPage(testUrl);
    if (page) return testUrl;
  }

  const links = $("a[href]")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter(Boolean) as string[];

  for (const href of links) {
    try {
      const linkUrl = new URL(href, baseUrl);
      if (!linkUrl.hostname.includes(domain)) continue;
      const pathLower = linkUrl.pathname.toLowerCase();
      if (paths.some((p) => pathLower.includes(p.replace("/", "")))) {
        const page = await fetchPublicPage(linkUrl.href);
        if (page) return linkUrl.href;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractVisibleContactsFromHtml(
  html: string,
  source: string,
  sourceUrl: string
): CollectedContact[] {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();

  const contacts: CollectedContact[] = [];
  const text = $("body").text().replace(/\s+/g, " ").trim();
  contacts.push(...extractContactsFromText(text, source, sourceUrl));

  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr("href");
    const email = href?.replace(/^mailto:/i, "").split("?")[0];
    if (email) {
      contacts.push({
        type: "EMAIL",
        value: email.toLowerCase(),
        label: "Mailto link",
        source,
        sourceUrl,
      });
    }
  });

  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr("href");
    const phone = href?.replace(/^tel:/i, "").trim();
    if (phone) {
      contacts.push({
        type: "PHONE",
        value: phone,
        label: "Tel link",
        source,
        sourceUrl,
      });
    }
  });

  return contacts;
}

function extractSchemaData(
  $: cheerio.CheerioAPI
): Record<string, unknown> | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const json = JSON.parse($(scripts[i]).html() || "");
      if (json["@type"] === "Organization" || json["@type"] === "LocalBusiness") {
        return json;
      }
      if (Array.isArray(json["@graph"])) {
        const org = json["@graph"].find(
          (item: Record<string, unknown>) =>
            item["@type"] === "Organization" ||
            item["@type"] === "LocalBusiness"
        );
        if (org) return org;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function extractContactsFromSchema(
  schema: Record<string, unknown>,
  sourceUrl: string
): CollectedContact[] {
  const contacts: CollectedContact[] = [];

  if (typeof schema.email === "string") {
    contacts.push({
      type: "EMAIL",
      value: schema.email,
      label: "Schema.org email",
      source: "structured_data",
      sourceUrl,
    });
  }

  if (typeof schema.telephone === "string") {
    contacts.push({
      type: "PHONE",
      value: schema.telephone,
      label: "Schema.org phone",
      source: "structured_data",
      sourceUrl,
    });
  }

  if (schema.address) {
    const addr =
      typeof schema.address === "string"
        ? schema.address
        : formatSchemaAddress(schema.address as Record<string, unknown>);
    if (addr) {
      contacts.push({
        type: "ADDRESS",
        value: addr,
        label: "Schema.org address",
        source: "structured_data",
        sourceUrl,
      });
    }
  }

  return contacts;
}

function formatSchemaAddress(addr: Record<string, unknown>): string {
  const parts = [
    addr.streetAddress,
    addr.addressLocality,
    addr.addressRegion,
    addr.postalCode,
    addr.addressCountry,
  ].filter(Boolean);
  return parts.join(", ");
}

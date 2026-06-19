import * as cheerio from "cheerio";
import type { CollectedContact, CollectorResult, PublicProfileData } from "./types";
import { logger } from "@/lib/logger";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const INSTAGRAM_WEB_APP_ID = "936619743392459";

interface InstagramBioLink {
  title?: string;
  url?: string;
  lynx_url?: string;
}

interface InstagramBusinessAddress {
  city_name?: string;
  street_address?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
}

interface InstagramWebUser {
  username?: string;
  full_name?: string;
  biography?: string;
  external_url?: string;
  profile_pic_url_hd?: string;
  profile_pic_url?: string;
  is_private?: boolean;
  is_verified?: boolean;
  is_business_account?: boolean;
  is_professional_account?: boolean;
  business_email?: string | null;
  business_phone_number?: string | null;
  contact_phone_number?: string | null;
  public_email?: string | null;
  business_contact_method?: string;
  business_category_name?: string;
  category_name?: string;
  overall_category_name?: string;
  category_enum?: string | null;
  business_address_json?: string | null;
  bio_links?: InstagramBioLink[];
  edge_followed_by?: { count?: number };
  edge_follow?: { count?: number };
  edge_owner_to_timeline_media?: { count?: number };
  highlight_reel_count?: number;
}

/**
 * Collector A: Public Instagram profile analyzer.
 * Uses Instagram's public web profile API and HTML fallbacks.
 * Only extracts information intentionally displayed on public profiles.
 */
export async function collectInstagramProfile(
  username: string
): Promise<CollectorResult<PublicProfileData>> {
  const contacts: CollectedContact[] = [];
  const errors: string[] = [];

  const cleanUsername = username.replace(/^@/, "").toLowerCase();
  const profileUrl = `https://www.instagram.com/${cleanUsername}/`;

  try {
    const apiResult = await fetchWebProfileInfo(cleanUsername, profileUrl);

    if (apiResult?.user) {
      const user = apiResult.user;

      if (user.is_private) {
        errors.push("Profile is private — only public profiles can be analyzed");
        return { success: false, data: null, contacts, errors };
      }

      const profileData = mapApiUserToProfile(user, profileUrl);
      contacts.push(...extractContactsFromUser(user, profileUrl));
      contacts.push(
        ...extractContactsFromText(user.biography || "", "instagram_bio", profileUrl)
      );

      for (const link of user.bio_links || []) {
        if (link.url) {
          contacts.push({
            type: "SOCIAL",
            value: link.url,
            label: link.title || "Bio link",
            source: "instagram_bio_link",
            sourceUrl: profileUrl,
          });
          contacts.push(
            ...extractContactsFromText(link.url, "instagram_bio_link", profileUrl)
          );
        }
      }

      if (profileData.websiteUrl) {
        contacts.push({
          type: "SOCIAL",
          value: profileData.websiteUrl,
          label: "Website from profile",
          source: "instagram_profile",
          sourceUrl: profileUrl,
        });
      }

      logger.info("Instagram profile collected via web API", {
        username: cleanUsername,
        contactCount: contacts.length,
      });

      return {
        success: true,
        data: profileData,
        contacts: dedupeContacts(contacts),
        errors,
      };
    }

    errors.push("Web profile API unavailable, trying HTML fallback");
    return await collectFromHtml(cleanUsername, profileUrl, errors);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    errors.push(`Failed to analyze public profile: ${message}`);
    logger.error("Instagram collector failed", error as Error, { username });

    try {
      return await collectFromHtml(cleanUsername, profileUrl, errors);
    } catch {
      return { success: false, data: null, contacts, errors };
    }
  }
}

async function fetchWebProfileInfo(
  username: string,
  profileUrl: string
): Promise<{ user: InstagramWebUser } | null> {
  const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": BROWSER_USER_AGENT,
      "X-IG-App-ID": INSTAGRAM_WEB_APP_ID,
      "X-Requested-With": "XMLHttpRequest",
      Accept: "*/*",
      Referer: profileUrl,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    logger.warn("Instagram web profile API failed", {
      username,
      status: response.status,
    });
    return null;
  }

  const payload = (await response.json()) as { data?: { user?: InstagramWebUser } };
  if (!payload.data?.user) return null;
  return { user: payload.data.user };
}

function mapApiUserToProfile(
  user: InstagramWebUser,
  profileUrl: string
): PublicProfileData {
  const address = parseBusinessAddress(user.business_address_json);
  const location = address
    ? [address.street_address, address.city_name, address.zip_code]
        .filter(Boolean)
        .join(", ")
    : undefined;

  return {
    platform: "instagram",
    username: user.username,
    displayName: user.full_name,
    bio: user.biography,
    websiteUrl: normalizeExternalUrl(user.external_url),
    businessCategory:
      user.category_name ||
      user.business_category_name ||
      user.overall_category_name,
    location,
    hasContactButton:
      !!user.business_contact_method ||
      !!user.business_email ||
      !!user.business_phone_number ||
      !!user.contact_phone_number ||
      user.is_business_account === true,
    profileImageUrl: user.profile_pic_url_hd || user.profile_pic_url,
    followerCount: user.edge_followed_by?.count,
    isPublic: !user.is_private,
    rawData: {
      profileUrl,
      followingCount: user.edge_follow?.count,
      postCount: user.edge_owner_to_timeline_media?.count,
      highlightCount: user.highlight_reel_count,
      isVerified: user.is_verified,
      isBusinessAccount: user.is_business_account,
      isProfessionalAccount: user.is_professional_account,
      businessContactMethod: user.business_contact_method,
      categoryEnum: user.category_enum,
      bioLinks: user.bio_links,
      businessAddress: address,
      extractionMethod: "web_profile_info_api",
    },
  };
}

function extractContactsFromUser(
  user: InstagramWebUser,
  profileUrl: string
): CollectedContact[] {
  const contacts: CollectedContact[] = [];

  if (user.business_email) {
    contacts.push({
      type: "EMAIL",
      value: user.business_email.toLowerCase(),
      label: "Business email",
      source: "instagram_profile",
      sourceUrl: profileUrl,
    });
  }

  if (user.public_email) {
    contacts.push({
      type: "EMAIL",
      value: user.public_email.toLowerCase(),
      label: "Public email",
      source: "instagram_profile",
      sourceUrl: profileUrl,
    });
  }

  const phone = user.business_phone_number || user.contact_phone_number;
  if (phone) {
    contacts.push({
      type: "PHONE",
      value: phone,
      label: "Business phone",
      source: "instagram_profile",
      sourceUrl: profileUrl,
    });
  }

  const address = parseBusinessAddress(user.business_address_json);
  if (address) {
    const formatted = [address.street_address, address.city_name, address.zip_code]
      .filter(Boolean)
      .join(", ");
    if (formatted) {
      contacts.push({
        type: "ADDRESS",
        value: formatted,
        label: "Business address",
        source: "instagram_profile",
        sourceUrl: profileUrl,
      });
    }
  }

  return contacts;
}

function parseBusinessAddress(
  json: string | null | undefined
): InstagramBusinessAddress | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as InstagramBusinessAddress;
  } catch {
    return null;
  }
}

function normalizeExternalUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.replace(/\\u0026/g, "&").trim();
}

async function collectFromHtml(
  cleanUsername: string,
  profileUrl: string,
  errors: string[]
): Promise<CollectorResult<PublicProfileData>> {
  const contacts: CollectedContact[] = [];

  const response = await fetch(profileUrl, {
    headers: {
      "User-Agent": BROWSER_USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    if (response.status === 404) {
      errors.push("Public profile not found");
    } else {
      errors.push(`Unable to access public profile (HTTP ${response.status})`);
    }
    return { success: false, data: null, contacts, errors };
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const isPrivate =
    html.includes("This Account is Private") ||
    html.includes('"is_private":true');

  if (isPrivate) {
    errors.push("Profile is private — only public profiles can be analyzed");
    return { success: false, data: null, contacts, errors };
  }

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const metaDescription = $('meta[property="og:description"]').attr("content");
  const ogImage = $('meta[property="og:image"]').attr("content");

  let displayName: string | undefined;
  let bio: string | undefined;
  let followerCount: number | undefined;

  if (ogTitle) {
    const match = ogTitle.match(/^(.+?)\s*\(@/);
    displayName = match?.[1]?.trim() || ogTitle;
  }

  if (metaDescription) {
    const genericBio = metaDescription.match(
      /^See Instagram photos and videos from/i
    );
    if (!genericBio) {
      const parts = metaDescription.split(" - ");
      if (parts.length > 1) {
        bio = parts.slice(1).join(" - ").trim();
      }
    }
    const followerMatch = metaDescription.match(/([\d,]+)\s+Followers/i);
    if (followerMatch) {
      followerCount = parseInt(followerMatch[1].replace(/,/g, ""), 10);
    }
  }

  const embedded = parseEmbeddedProfileData(html);
  if (embedded.biography && !bio) bio = embedded.biography;
  if (embedded.full_name && !displayName) displayName = embedded.full_name;
  if (embedded.follower_count && !followerCount) {
    followerCount = embedded.follower_count;
  }

  const websiteUrl = normalizeExternalUrl(embedded.external_url);
  const businessCategory = embedded.category_name;
  const location = embedded.city_name;

  if (websiteUrl) {
    contacts.push({
      type: "SOCIAL",
      value: websiteUrl,
      label: "Website from profile",
      source: "instagram_profile",
      sourceUrl: profileUrl,
    });
  }

  contacts.push(...extractContactsFromText(bio || "", "instagram_bio", profileUrl));
  contacts.push(...extractContactsFromText(html, "instagram_profile", profileUrl));

  const data: PublicProfileData = {
    platform: "instagram",
    username: cleanUsername,
    displayName: displayName || $("title").text().replace(" • Instagram", ""),
    bio,
    websiteUrl,
    businessCategory,
    location,
    hasContactButton: embedded.is_business_account || false,
    profileImageUrl: ogImage || embedded.profile_pic_url,
    followerCount,
    isPublic: true,
    rawData: {
      profileUrl,
      metaDescription,
      extractionMethod: "html_fallback",
      ...embedded,
    },
  };

  return {
    success: true,
    data,
    contacts: dedupeContacts(contacts),
    errors,
  };
}

function parseEmbeddedProfileData(html: string) {
  const result: Record<string, unknown> = {};

  const patterns: Record<string, RegExp> = {
    biography: /"biography":"((?:[^"\\]|\\.)*)"/,
    full_name: /"full_name":"((?:[^"\\]|\\.)*)"/,
    external_url: /"external_url":"((?:[^"\\]|\\.)*)"/,
    category_name: /"category_name":"((?:[^"\\]|\\.)*)"/,
    city_name: /"city_name":"((?:[^"\\]|\\.)*)"/,
    profile_pic_url: /"profile_pic_url":"((?:[^"\\]|\\.)*)"/,
    business_email: /"business_email":"((?:[^"\\]|\\.)*)"/,
    business_phone_number: /"business_phone_number":"((?:[^"\\]|\\.)*)"/,
  };

  for (const [key, regex] of Object.entries(patterns)) {
    const match = html.match(regex);
    if (match?.[1]) {
      result[key] = match[1].replace(/\\u0026/g, "&").replace(/\\n/g, "\n");
    }
  }

  const followerMatch = html.match(/"edge_followed_by":\{"count":(\d+)\}/);
  if (followerMatch) result.follower_count = parseInt(followerMatch[1], 10);

  const followingMatch = html.match(/"edge_follow":\{"count":(\d+)\}/);
  if (followingMatch) result.following_count = parseInt(followingMatch[1], 10);

  const postsMatch = html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)\}/);
  if (postsMatch) result.post_count = parseInt(postsMatch[1], 10);

  result.is_business_account = /"is_business_account":true/.test(html);
  result.is_verified = /"is_verified":true/.test(html);

  return result as {
    biography?: string;
    full_name?: string;
    external_url?: string;
    category_name?: string;
    city_name?: string;
    profile_pic_url?: string;
    business_email?: string;
    business_phone_number?: string;
    follower_count?: number;
    following_count?: number;
    post_count?: number;
    is_business_account?: boolean;
    is_verified?: boolean;
  };
}

export function extractContactsFromText(
  text: string,
  source: string,
  sourceUrl?: string
): CollectedContact[] {
  const contacts: CollectedContact[] = [];
  const emails = [...new Set(text.match(EMAIL_REGEX) || [])];
  const phones = [...new Set(text.match(PHONE_REGEX) || [])];

  for (const email of emails) {
    if (!isHiddenEmail(email)) {
      contacts.push({
        type: "EMAIL",
        value: email.toLowerCase(),
        source,
        sourceUrl,
      });
    }
  }

  for (const phone of phones) {
    const cleaned = phone.trim();
    if (isValidPublicPhone(cleaned)) {
      contacts.push({
        type: "PHONE",
        value: cleaned,
        source,
        sourceUrl,
      });
    }
  }

  return contacts;
}

function dedupeContacts(contacts: CollectedContact[]): CollectedContact[] {
  const seen = new Set<string>();
  return contacts.filter((c) => {
    const key = `${c.type}:${c.value.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isValidPublicPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return false;
  if (digits.length > 11 && !phone.includes("+") && !/[-.\s()]/.test(phone)) {
    return false;
  }
  return true;
}

function isHiddenEmail(email: string): boolean {
  const hiddenPatterns = [
    /noreply/i,
    /no-reply/i,
    /donotreply/i,
    /mailer-daemon/i,
    /postmaster/i,
    /example\.com$/i,
    /test\.com$/i,
    /sentry\.io$/i,
    /wixpress\.com$/i,
    /instagram\.com$/i,
    /facebook\.com$/i,
  ];
  return hiddenPatterns.some((p) => p.test(email));
}

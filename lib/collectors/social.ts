import type { CollectedContact, CollectorResult, SocialProfile } from "./types";
import { logger } from "@/lib/logger";

const PLATFORMS = [
  {
    name: "linkedin",
    buildUrl: (query: string) =>
      `https://www.linkedin.com/company/${encodeURIComponent(query)}`,
    pattern: /linkedin\.com\/company\/([^/?\s]+)/i,
  },
  {
    name: "github",
    buildUrl: (query: string) =>
      `https://github.com/${encodeURIComponent(query)}`,
    pattern: /github\.com\/([^/?\s]+)/i,
  },
  {
    name: "twitter",
    buildUrl: (query: string) =>
      `https://x.com/${encodeURIComponent(query)}`,
    pattern: /(?:twitter|x)\.com\/([^/?\s]+)/i,
  },
  {
    name: "facebook",
    buildUrl: (query: string) =>
      `https://www.facebook.com/${encodeURIComponent(query)}`,
    pattern: /facebook\.com\/([^/?\s]+)/i,
  },
  {
    name: "youtube",
    buildUrl: (query: string) =>
      `https://www.youtube.com/@${encodeURIComponent(query)}`,
    pattern: /youtube\.com\/(?:@|c\/|channel\/)([^/?\s]+)/i,
  },
] as const;

/**
 * Collector C: Social profile discovery.
 * Discovers publicly accessible social media profiles.
 */
export async function discoverSocialProfiles(
  query: string,
  knownUrls: string[] = []
): Promise<CollectorResult<SocialProfile[]>> {
  const contacts: CollectedContact[] = [];
  const errors: string[] = [];
  const profiles: SocialProfile[] = [];
  const seen = new Set<string>();

  const normalizedQuery = query
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/\s+/g, "");

  for (const url of knownUrls) {
    for (const platform of PLATFORMS) {
      const match = url.match(platform.pattern);
      if (match) {
        const key = `${platform.name}:${match[1]}`;
        if (!seen.has(key)) {
          seen.add(key);
          profiles.push({
            platform: platform.name,
            url,
            username: match[1],
          });
          contacts.push({
            type: "SOCIAL",
            value: url,
            label: `${platform.name} profile`,
            source: "known_url",
            sourceUrl: url,
          });
        }
      }
    }
  }

  const checks = PLATFORMS.map(async (platform) => {
    const key = `${platform.name}:${normalizedQuery}`;
    if (seen.has(key)) return;

    const url = platform.buildUrl(normalizedQuery);
    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; PCIPBot/1.0; +https://pcip.example.com/bot)",
        },
        signal: AbortSignal.timeout(10000),
        redirect: "follow",
      });

      if (response.ok || response.status === 200) {
        seen.add(key);
        profiles.push({
          platform: platform.name,
          url: response.url || url,
          username: normalizedQuery,
        });
        contacts.push({
          type: "SOCIAL",
          value: response.url || url,
          label: `${platform.name} profile`,
          source: "social_discovery",
          sourceUrl: response.url || url,
        });
      }
    } catch {
      // Profile not publicly accessible
    }
  });

  await Promise.allSettled(checks);

  logger.info("Social profiles discovered", {
    query: normalizedQuery,
    count: profiles.length,
  });

  return {
    success: profiles.length > 0,
    data: profiles,
    contacts,
    errors,
  };
}

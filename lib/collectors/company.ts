import type { CollectedContact, CollectorResult, CompanyIntelligence } from "./types";
import { collectWebsiteData } from "./website";
import { discoverSocialProfiles } from "./social";
import { logger } from "@/lib/logger";

/**
 * Collector D: Company intelligence.
 * Aggregates publicly available company information from multiple sources.
 */
export async function collectCompanyIntelligence(
  companyName: string,
  websiteUrl?: string
): Promise<CollectorResult<CompanyIntelligence>> {
  const contacts: CollectedContact[] = [];
  const errors: string[] = [];

  const intelligence: CompanyIntelligence = {
    name: companyName,
    description: undefined,
    addresses: [],
    emails: [],
    supportChannels: [],
    industry: undefined,
  };

  try {
    if (websiteUrl) {
      const websiteResult = await collectWebsiteData(websiteUrl);
      if (websiteResult.success && websiteResult.data) {
        intelligence.description = websiteResult.data.description;
        contacts.push(...websiteResult.contacts);

        for (const contact of websiteResult.contacts) {
          if (contact.type === "EMAIL") intelligence.emails.push(contact.value);
          if (contact.type === "ADDRESS")
            intelligence.addresses.push(contact.value);
        }

        if (websiteResult.data.schemaData) {
          const schema = websiteResult.data.schemaData;
          if (typeof schema.industry === "string") {
            intelligence.industry = schema.industry;
          }
        }
      } else {
        errors.push(...websiteResult.errors);
      }
    }

    const socialResult = await discoverSocialProfiles(companyName, websiteUrl ? [websiteUrl] : []);
    if (socialResult.success && socialResult.data) {
      contacts.push(...socialResult.contacts);
      for (const profile of socialResult.data) {
        intelligence.supportChannels.push(profile.url);
      }
    }

    const supportPatterns = ["support@", "help@", "contact@", "info@", "sales@"];
    for (const email of intelligence.emails) {
      if (supportPatterns.some((p) => email.startsWith(p))) {
        if (!intelligence.supportChannels.includes(email)) {
          intelligence.supportChannels.push(email);
        }
      }
    }

    logger.info("Company intelligence collected", { companyName });
    return {
      success: true,
      data: intelligence,
      contacts,
      errors,
    };
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Company intelligence failed"
    );
    logger.error("Company collector failed", error as Error, { companyName });
    return { success: false, data: intelligence, contacts, errors };
  }
}

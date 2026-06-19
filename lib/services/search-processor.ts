import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import { collectInstagramProfile } from "@/lib/collectors/instagram";
import { collectWebsiteData } from "@/lib/collectors/website";
import { discoverSocialProfiles } from "@/lib/collectors/social";
import { collectCompanyIntelligence } from "@/lib/collectors/company";
import { scoreContacts } from "@/lib/data-quality/scoring";
import type { CollectedContact } from "@/lib/collectors/types";
import type { SearchInputType } from "@prisma/client";

export async function processSearch(searchId: string): Promise<void> {
  const search = await prisma.search.findUnique({ where: { id: searchId } });
  if (!search) throw new Error(`Search ${searchId} not found`);

  await prisma.search.update({
    where: { id: searchId },
    data: { status: "PROCESSING", startedAt: new Date() },
  });

  const allContacts: CollectedContact[] = [];
  const errors: string[] = [];

  try {
    switch (search.inputType) {
      case "INSTAGRAM_USERNAME": {
        const result = await collectInstagramProfile(search.inputValue);
        if (result.data) {
          await prisma.profile.create({
            data: {
              searchId,
              platform: result.data.platform,
              username: result.data.username,
              displayName: result.data.displayName,
              bio: result.data.bio,
              websiteUrl: result.data.websiteUrl,
              businessCategory: result.data.businessCategory,
              location: result.data.location,
              hasContactButton: result.data.hasContactButton,
              profileImageUrl: result.data.profileImageUrl,
              followerCount: result.data.followerCount,
              isPublic: result.data.isPublic,
              rawData: (result.data.rawData ?? undefined) as Prisma.InputJsonValue | undefined,
            },
          });

          if (result.data.websiteUrl) {
            const websiteResult = await collectWebsiteData(
              result.data.websiteUrl
            );
            if (websiteResult.data) {
              await saveWebsite(searchId, websiteResult.data);
            }
            allContacts.push(...websiteResult.contacts);
          }
        }
        allContacts.push(...result.contacts);
        errors.push(...result.errors);
        break;
      }

      case "WEBSITE_URL": {
        const result = await collectWebsiteData(search.inputValue);
        if (result.data) {
          await saveWebsite(searchId, result.data);
        }
        allContacts.push(...result.contacts);
        errors.push(...result.errors);

        const socialResult = await discoverSocialProfiles(
          result.data?.title || search.inputValue,
          [search.inputValue]
        );
        allContacts.push(...socialResult.contacts);
        break;
      }

      case "COMPANY_NAME":
      case "BRAND_NAME": {
        const result = await collectCompanyIntelligence(search.inputValue);
        if (result.data?.description) {
          await prisma.website.create({
            data: {
              searchId,
              url: search.inputValue,
              title: result.data.name,
              description: result.data.description,
            },
          });
        }
        allContacts.push(...result.contacts);
        errors.push(...result.errors);

        const socialResult = await discoverSocialProfiles(search.inputValue);
        allContacts.push(...socialResult.contacts);
        break;
      }
    }

    const scoredContacts = scoreContacts(allContacts);

    if (scoredContacts.length > 0) {
      await prisma.contact.createMany({
        data: scoredContacts.map((c) => ({
          searchId,
          type: c.type,
          value: c.value,
          label: c.label,
          source: c.source,
          sourceUrl: c.sourceUrl,
          confidence: c.confidence,
          confidenceScore: c.confidenceScore,
          metadata: (c.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        })),
      });
    }

    await prisma.search.update({
      where: { id: searchId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        errorMessage: errors.length ? errors.join("; ") : null,
      },
    });

    logger.info("Search completed", {
      searchId,
      contactsFound: scoredContacts.length,
    });
  } catch (error) {
    await prisma.search.update({
      where: { id: searchId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage:
          error instanceof Error ? error.message : "Processing failed",
      },
    });
    throw error;
  }
}

async function saveWebsite(
  searchId: string,
  data: {
    url: string;
    title?: string;
    description?: string;
    contactPageUrl?: string;
    aboutPageUrl?: string;
    teamPageUrl?: string;
    footerText?: string;
    schemaData?: Record<string, unknown>;
    rawData?: Record<string, unknown>;
  }
) {
  await prisma.website.create({
    data: {
      searchId,
      url: data.url,
      title: data.title,
      description: data.description,
      contactPageUrl: data.contactPageUrl,
      aboutPageUrl: data.aboutPageUrl,
      teamPageUrl: data.teamPageUrl,
      footerText: data.footerText,
      schemaData: (data.schemaData ?? undefined) as Prisma.InputJsonValue | undefined,
      rawData: (data.rawData ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export function detectInputType(value: string): SearchInputType {
  const trimmed = value.trim();
  if (trimmed.match(/^@?[\w.]+$/) && !trimmed.includes(".")) {
    return "INSTAGRAM_USERNAME";
  }
  if (trimmed.match(/^https?:\/\//i) || trimmed.match(/^[\w-]+\.[\w.]+/)) {
    return "WEBSITE_URL";
  }
  return "COMPANY_NAME";
}

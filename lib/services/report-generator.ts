import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { generateAiInsights } from "@/lib/ai/insights";
import { uploadFile } from "@/lib/storage/s3";
import { logger } from "@/lib/logger";

export async function generateReport(
  reportId: string,
  searchId: string,
  includeAiInsights: boolean
): Promise<void> {
  const search = await prisma.search.findUnique({
    where: { id: searchId },
    include: {
      profile: true,
      website: true,
      contacts: { orderBy: { confidenceScore: "desc" } },
    },
  });

  if (!search) throw new Error(`Search ${searchId} not found`);

  let aiInsights = null;
  if (includeAiInsights) {
    aiInsights = await generateAiInsights({
      profile: search.profile
        ? {
            displayName: search.profile.displayName || undefined,
            bio: search.profile.bio || undefined,
            businessCategory: search.profile.businessCategory || undefined,
            location: search.profile.location || undefined,
            websiteUrl: search.profile.websiteUrl || undefined,
          }
        : undefined,
      website: search.website
        ? {
            title: search.website.title || undefined,
            description: search.website.description || undefined,
            url: search.website.url,
          }
        : undefined,
      contacts: search.contacts.map((c) => ({
        type: c.type,
        value: c.value,
        confidence: c.confidence,
        source: c.source,
      })),
      companyName: search.inputValue,
    });
  }

  const reportContent = {
    generatedAt: new Date().toISOString(),
    search: {
      id: search.id,
      inputType: search.inputType,
      inputValue: search.inputValue,
      status: search.status,
      completedAt: search.completedAt,
    },
    profileSummary: search.profile
      ? {
          platform: search.profile.platform,
          username: search.profile.username,
          displayName: search.profile.displayName,
          bio: search.profile.bio,
          websiteUrl: search.profile.websiteUrl,
          businessCategory: search.profile.businessCategory,
          location: search.profile.location,
        }
      : null,
    websiteSummary: search.website
      ? {
          url: search.website.url,
          title: search.website.title,
          description: search.website.description,
          contactPageUrl: search.website.contactPageUrl,
          aboutPageUrl: search.website.aboutPageUrl,
        }
      : null,
    contacts: search.contacts.map((c) => ({
      type: c.type,
      value: c.value,
      label: c.label,
      source: c.source,
      sourceUrl: c.sourceUrl,
      confidence: c.confidence,
      confidenceScore: c.confidenceScore,
    })),
    aiInsights,
  };

  const storageKey = `reports/${search.userId}/${reportId}.json`;
  await uploadFile(
    storageKey,
    JSON.stringify(reportContent, null, 2),
    "application/json"
  );

  await prisma.report.update({
    where: { id: reportId },
    data: {
      content: reportContent as Prisma.InputJsonValue,
      aiInsights: (aiInsights ?? undefined) as Prisma.InputJsonValue | undefined,
      storageKey,
    },
  });

  logger.info("Report generated", { reportId, searchId });
}

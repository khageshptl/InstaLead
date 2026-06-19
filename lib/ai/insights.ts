import OpenAI from "openai";
import { logger } from "@/lib/logger";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface SearchInsightsInput {
  profile?: {
    displayName?: string;
    bio?: string;
    businessCategory?: string;
    location?: string;
    websiteUrl?: string;
  };
  website?: {
    title?: string;
    description?: string;
    url?: string;
  };
  contacts: Array<{
    type: string;
    value: string;
    confidence: string;
    source: string;
  }>;
  companyName?: string;
}

export interface AiInsights {
  businessSummary: string;
  industryClassification: string;
  contactRecommendations: string[];
  outreachSuggestions: string[];
  generatedAt: string;
}

export async function generateAiInsights(
  input: SearchInsightsInput
): Promise<AiInsights | null> {
  if (!openai) {
    logger.warn("OpenAI not configured, skipping AI insights");
    return generateFallbackInsights(input);
  }

  const prompt = `You are a business intelligence analyst. Analyze ONLY the publicly available information provided below. Do not speculate about private data, hidden contacts, or non-public information.

Public Data:
${JSON.stringify(input, null, 2)}

Provide a JSON response with:
- businessSummary: 2-3 sentence summary of the business
- industryClassification: industry/sector classification
- contactRecommendations: array of recommended public contact approaches (max 5)
- outreachSuggestions: array of professional outreach tips (max 5)

Respond ONLY with valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You analyze publicly available business information only. Never suggest accessing private or hidden data.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return generateFallbackInsights(input);

    const parsed = JSON.parse(content);
    return {
      businessSummary: parsed.businessSummary || "No summary available.",
      industryClassification:
        parsed.industryClassification || "Unclassified",
      contactRecommendations: parsed.contactRecommendations || [],
      outreachSuggestions: parsed.outreachSuggestions || [],
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("AI insights generation failed", error as Error);
    return generateFallbackInsights(input);
  }
}

function generateFallbackInsights(input: SearchInsightsInput): AiInsights {
  const name =
    input.profile?.displayName ||
    input.website?.title ||
    input.companyName ||
    "Unknown business";

  const highConfidenceContacts = input.contacts.filter(
    (c) => c.confidence === "HIGH"
  );

  return {
    businessSummary: `${name} is a business with publicly available online presence.${input.profile?.bio ? ` ${input.profile.bio}` : ""}`,
    industryClassification:
      input.profile?.businessCategory || "General Business",
    contactRecommendations: highConfidenceContacts.length
      ? highConfidenceContacts.map(
          (c) => `Use ${c.type.toLowerCase()} contact: ${c.value} (source: ${c.source})`
        )
      : ["Review publicly listed contact pages for official channels"],
    outreachSuggestions: [
      "Reference their public business profile when reaching out",
      "Use official contact channels found on their website",
      "Keep outreach professional and respect privacy preferences",
    ],
    generatedAt: new Date().toISOString(),
  };
}

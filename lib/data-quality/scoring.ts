import type { ConfidenceLevel } from "@prisma/client";
import type { CollectedContact } from "@/lib/collectors/types";

const SOURCE_CONFIDENCE: Record<string, { level: ConfidenceLevel; score: number }> = {
  contact_page: { level: "HIGH", score: 0.95 },
  website_footer: { level: "HIGH", score: 0.9 },
  structured_data: { level: "HIGH", score: 0.92 },
  instagram_profile: { level: "HIGH", score: 0.85 },
  instagram_bio: { level: "MEDIUM", score: 0.7 },
  instagram_bio_link: { level: "MEDIUM", score: 0.72 },
  about_page: { level: "MEDIUM", score: 0.7 },
  team_page: { level: "MEDIUM", score: 0.65 },
  social_discovery: { level: "MEDIUM", score: 0.6 },
  known_url: { level: "MEDIUM", score: 0.75 },
  third_party: { level: "LOW", score: 0.3 },
};

export interface ScoredContact extends CollectedContact {
  confidence: ConfidenceLevel;
  confidenceScore: number;
}

export function scoreContact(contact: CollectedContact): ScoredContact {
  const mapping = SOURCE_CONFIDENCE[contact.source] || {
    level: "LOW" as ConfidenceLevel,
    score: 0.4,
  };

  let score = mapping.score;

  if (contact.type === "EMAIL") {
    const email = contact.value.toLowerCase();
    if (
      email.startsWith("contact@") ||
      email.startsWith("info@") ||
      email.startsWith("hello@")
    ) {
      score = Math.min(1, score + 0.05);
    }
    if (email.includes("noreply") || email.includes("no-reply")) {
      score = Math.max(0.1, score - 0.3);
    }
  }

  if (contact.label?.toLowerCase().includes("official")) {
    score = Math.min(1, score + 0.1);
  }

  return {
    ...contact,
    confidence: scoreToLevel(score),
    confidenceScore: Math.round(score * 100) / 100,
  };
}

export function scoreContacts(contacts: CollectedContact[]): ScoredContact[] {
  const scored = contacts.map(scoreContact);
  return deduplicateContacts(scored);
}

function scoreToLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) return "HIGH";
  if (score >= 0.5) return "MEDIUM";
  return "LOW";
}

function deduplicateContacts(contacts: ScoredContact[]): ScoredContact[] {
  const map = new Map<string, ScoredContact>();

  for (const contact of contacts) {
    const key = `${contact.type}:${contact.value.toLowerCase()}`;
    const existing = map.get(key);
    if (!existing || contact.confidenceScore > existing.confidenceScore) {
      map.set(key, contact);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.confidenceScore - a.confidenceScore
  );
}

export function getConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case "HIGH":
      return "High — Official public source";
    case "MEDIUM":
      return "Medium — Secondary public source";
    case "LOW":
      return "Low — Third-party reference";
  }
}

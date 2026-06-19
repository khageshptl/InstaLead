import { describe, it, expect } from "vitest";
import { scoreContact, scoreContacts } from "@/lib/data-quality/scoring";
import type { CollectedContact } from "@/lib/collectors/types";

describe("Data Quality Scoring", () => {
  it("scores contact page emails as high confidence", () => {
    const contact: CollectedContact = {
      type: "EMAIL",
      value: "contact@example.com",
      source: "contact_page",
    };
    const scored = scoreContact(contact);
    expect(scored.confidence).toBe("HIGH");
    expect(scored.confidenceScore).toBeGreaterThanOrEqual(0.8);
  });

  it("scores third-party sources as low confidence", () => {
    const contact: CollectedContact = {
      type: "EMAIL",
      value: "info@example.com",
      source: "third_party",
    };
    const scored = scoreContact(contact);
    expect(scored.confidence).toBe("LOW");
  });

  it("deduplicates contacts keeping highest confidence", () => {
    const contacts: CollectedContact[] = [
      { type: "EMAIL", value: "info@example.com", source: "about_page" },
      { type: "EMAIL", value: "info@example.com", source: "contact_page" },
    ];
    const scored = scoreContacts(contacts);
    expect(scored).toHaveLength(1);
    expect(scored[0].source).toBe("contact_page");
  });
});

describe("Contact Discovery Rules", () => {
  it("only processes public source types", () => {
    const allowedSources = [
      "contact_page",
      "website_footer",
      "structured_data",
      "instagram_profile",
      "about_page",
      "team_page",
      "social_discovery",
    ];

    for (const source of allowedSources) {
      const contact: CollectedContact = {
        type: "EMAIL",
        value: "test@example.com",
        source,
      };
      const scored = scoreContact(contact);
      expect(scored.confidenceScore).toBeGreaterThan(0);
    }
  });
});

import { describe, expect, it } from "vitest";
import aiJson from "@/data/sources/ai.json";
import { SOURCE_IDS, SourceSchema } from "@/data/sources.schema";

describe("SourceSchema", () => {
  it("accepts a minimal valid source", () => {
    const ok = SourceSchema.parse({
      id: "war",
      labelKey: "sources.war.label",
      currentYear: 2026,
      projection: {
        totalUsd: 3_113_000_000_000,
        basedOnYear: 2025,
        baseAmountUsd: 2_887_000_000_000,
        growthFactor: 1.0783,
        growthBasis: "5-year geomean",
      },
      source: "SIPRI",
      sourceUrl: "https://sipri.org/databases/milex",
      lastUpdated: "2026-04-29",
      categories: Array.from({ length: 6 }, (_, i) => ({
        id: `c-${i}`,
        titleKey: `categories.war.c${i}.title`,
        unitLabelKey: `categories.war.c${i}.unit`,
        symbol: "coin",
        scaleHint: "perUnit",
        unitCostUsd: 1000,
        sources: [{ name: "Test", url: "https://example.com", year: 2024 }],
        methodology: "test",
      })),
    });
    expect(ok.id).toBe("war");
  });

  it("rejects fewer than 6 categories", () => {
    expect(() =>
      SourceSchema.parse({
        id: "war",
        labelKey: "x",
        currentYear: 2026,
        projection: {
          totalUsd: 1,
          basedOnYear: 2025,
          baseAmountUsd: 1,
          growthBasis: "x",
        },
        source: "x",
        sourceUrl: "https://example.com",
        lastUpdated: "2026-04-29",
        categories: [],
      }),
    ).toThrow();
  });

  it("exposes the canonical id list", () => {
    expect(SOURCE_IDS).toEqual(["war", "tobacco", "fossil-fuels", "ai"]);
  });
});

describe("ai source", () => {
  it("is registered in SOURCE_IDS", () => {
    expect(SOURCE_IDS).toContain("ai");
  });

  it("parses ai.json against the schema", () => {
    expect(() => SourceSchema.parse(aiJson)).not.toThrow();
  });

  it("has the expected top-level shape", () => {
    const ai = SourceSchema.parse(aiJson);
    expect(ai.id).toBe("ai");
    expect(ai.currentYear).toBe(2026);
    expect(ai.categories.length).toBeGreaterThanOrEqual(8);
    expect(ai.projection.totalUsd).toBe(770_000_000_000);
  });
});

describe("ai aiBenefit field", () => {
  it("every ai category has aiBenefit with text and at least one source", () => {
    const parsed = SourceSchema.parse(aiJson);
    for (const cat of parsed.categories) {
      expect(cat.aiBenefit, `category ${cat.id} should have aiBenefit`).toBeDefined();
      expect(cat.aiBenefit?.text.length).toBeGreaterThan(0);
      expect(cat.aiBenefit?.sources.length).toBeGreaterThanOrEqual(1);
      expect(cat.aiBenefit?.sources[0]?.url).toMatch(/^https:\/\//);
    }
  });
});

import { describe, expect, it } from "vitest";
import { SourceSchema, SOURCE_IDS } from "@/data/sources.schema";

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
    expect(SOURCE_IDS).toEqual(["war", "tobacco", "fossil-fuels"]);
  });
});

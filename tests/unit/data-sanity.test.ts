/**
 * Sanity tests against the real data files. These guard against regressions
 * in data updates — e.g. accidentally setting unitCostUsd to 0, breaking
 * sources, picking a scaleHint that produces a degenerate matrix.
 *
 * Previously imported legacy data/categories.schema and data/military-spending.schema.
 * Since Task 10, both are removed. All data now lives in data/sources/*.json and
 * is accessed via data/sources.index (getSource, SOURCES_LIST).
 */
import { describe, expect, it } from "vitest";
import { SOURCES_LIST, getSource } from "@/data/sources.index";
import { computeCategoryMetric, computeSymbolCount, pickMatrixMode } from "@/lib/categories";

const warSource = getSource("war");

describe("military-spending data (via war source)", () => {
  it("has currentYear set", () => {
    expect(warSource.currentYear).toBeGreaterThan(2024);
  });

  it("has a positive projection total", () => {
    expect(warSource.projection.totalUsd).toBeGreaterThan(1_000_000_000_000);
  });

  it("has at least 5 historical years of actual data", () => {
    const actuals = (warSource.historical ?? []).filter((h) => h.actual);
    expect(actuals.length).toBeGreaterThanOrEqual(5);
  });

  it("projection.totalUsd matches base × growthFactor^(currentYear - basedOnYear)", () => {
    const { totalUsd, baseAmountUsd, growthFactor, basedOnYear } = warSource.projection;
    if (!growthFactor) return; // flat-annual sources omit growthFactor; war always has it
    const years = warSource.currentYear - basedOnYear;
    const expected = baseAmountUsd * growthFactor ** years;
    // 0.1% tolerance
    expect(Math.abs(totalUsd - expected) / expected).toBeLessThan(0.001);
  });
});

// ---------------------------------------------------------------------------
// Per-source category invariants — applied to every source in SOURCES_LIST.
// ---------------------------------------------------------------------------
for (const source of SOURCES_LIST) {
  describe(`categories data (${source.id})`, () => {
    const { categories } = source;
    const total = source.projection.totalUsd;

    it("has at least 6 categories", () => {
      expect(categories.length).toBeGreaterThanOrEqual(6);
    });

    it("every category has a positive unitCostUsd", () => {
      for (const c of categories) {
        expect(c.unitCostUsd, `${c.id} unitCostUsd`).toBeGreaterThan(0);
      }
    });

    it("every category has at least 1 source", () => {
      for (const c of categories) {
        expect(c.sources.length, `${c.id} sources`).toBeGreaterThanOrEqual(1);
      }
    });

    it("every category has a methodology longer than 20 chars", () => {
      for (const c of categories) {
        expect(c.methodology.length, `${c.id} methodology`).toBeGreaterThan(20);
      }
    });

    it("all category ids are unique within the source", () => {
      const ids = categories.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("every category produces a non-zero visible matrix when paired with the projection", () => {
      for (const c of categories) {
        const metric = computeCategoryMetric(c, total);
        const mode = pickMatrixMode(metric);
        const { visibleCount } = computeSymbolCount(metric, mode);
        expect(visibleCount, `${c.id} visibleCount`).toBeGreaterThan(0);
      }
    });
  });
}

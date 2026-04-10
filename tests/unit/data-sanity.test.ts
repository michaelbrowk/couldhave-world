/**
 * Sanity tests against the real data files. These guard against regressions
 * in data updates — e.g. accidentally setting unitCostUsd to 0, breaking
 * sources, picking a scaleHint that produces a degenerate matrix.
 */
import { describe, expect, it } from "vitest";
import { categories } from "@/data/categories.schema";
import { militarySpending } from "@/data/military-spending.schema";
import { computeCategoryMetric, computeSymbolCount, pickMatrixMode } from "@/lib/categories";

describe("military-spending data", () => {
  it("has currentYear set", () => {
    expect(militarySpending.currentYear).toBeGreaterThan(2024);
  });

  it("has a positive projection total", () => {
    expect(militarySpending.projection.totalUsd).toBeGreaterThan(1_000_000_000_000);
  });

  it("has at least 5 historical years of actual data", () => {
    const actuals = militarySpending.historical.filter((h) => h.actual);
    expect(actuals.length).toBeGreaterThanOrEqual(5);
  });

  it("has 15 top countries", () => {
    expect(militarySpending.topCountries).toHaveLength(15);
  });

  it("top countries are sorted descending by amount", () => {
    const amounts = militarySpending.topCountries.map((c) => c.amountUsd);
    const sorted = [...amounts].sort((a, b) => b - a);
    expect(amounts).toEqual(sorted);
  });

  it("US is the #1 spender", () => {
    expect(militarySpending.topCountries[0]?.countryCode).toBe("US");
  });

  it("projection.totalUsd matches base × growthFactor^(currentYear - basedOnYear)", () => {
    const { totalUsd, baseAmountUsd, growthFactor, basedOnYear } = militarySpending.projection;
    const years = militarySpending.currentYear - basedOnYear;
    const expected = baseAmountUsd * growthFactor ** years;
    // 0.1% tolerance
    expect(Math.abs(totalUsd - expected) / expected).toBeLessThan(0.001);
  });
});

describe("categories data", () => {
  it("has exactly 10 categories", () => {
    expect(categories).toHaveLength(10);
  });

  it("every category has a positive unitCostUsd", () => {
    for (const c of categories) {
      expect(c.unitCostUsd, `${c.id} unitCostUsd`).toBeGreaterThan(0);
    }
  });

  it("every category has at least 2 sources", () => {
    for (const c of categories) {
      expect(c.sources.length, `${c.id} sources`).toBeGreaterThanOrEqual(2);
    }
  });

  it("every category has a non-empty methodology", () => {
    for (const c of categories) {
      expect(c.methodology.length, `${c.id} methodology`).toBeGreaterThan(20);
    }
  });

  it("all category ids are unique", () => {
    const ids = categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every category produces a non-zero visible matrix when paired with the projection", () => {
    const total = militarySpending.projection.totalUsd;
    for (const c of categories) {
      const metric = computeCategoryMetric(c, total);
      const mode = pickMatrixMode(metric);
      const { visibleCount } = computeSymbolCount(metric, mode);
      expect(visibleCount, `${c.id} visibleCount`).toBeGreaterThan(0);
    }
  });

  it("dense-mode categories produce a sane number of symbols (between 50 and 500)", () => {
    const total = militarySpending.projection.totalUsd;
    for (const c of categories) {
      const metric = computeCategoryMetric(c, total);
      const mode = pickMatrixMode(metric);
      if (mode === "dense") {
        const { visibleCount } = computeSymbolCount(metric, mode);
        expect(visibleCount, `${c.id} dense visibleCount`).toBeGreaterThanOrEqual(50);
        expect(visibleCount, `${c.id} dense visibleCount`).toBeLessThanOrEqual(500);
      }
    }
  });
});

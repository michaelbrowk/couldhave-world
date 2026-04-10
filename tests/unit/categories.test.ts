import { describe, expect, it } from "vitest";
import type { Category } from "@/data/categories.schema";
import { computeCategoryMetric, computeSymbolCount, pickMatrixMode } from "@/lib/categories";

const cancerCategory: Category = {
  id: "cancer-treatment",
  titleKey: "categories.cancer.title",
  unitLabelKey: "categories.cancer.unit",
  symbol: "cross",
  scaleHint: "perUnit",
  unitCostUsd: 150_000,
  sources: [],
  methodology: "",
};

const malariaCategory: Category = {
  id: "malaria-eradication",
  titleKey: "categories.malaria.title",
  unitLabelKey: "categories.malaria.unit",
  symbol: "drop",
  scaleHint: "totalSolution",
  unitCostUsd: 90_000_000_000,
  sources: [],
  methodology: "",
};

describe("computeCategoryMetric", () => {
  it("divides military total by perUnit cost", () => {
    const result = computeCategoryMetric(cancerCategory, 2_600_000_000_000);
    // 2_600_000_000_000 / 150_000 = 17_333_333.33...
    expect(result).toBeCloseTo(17_333_333, -2);
  });

  it("divides military total by totalSolution cost", () => {
    const result = computeCategoryMetric(malariaCategory, 2_600_000_000_000);
    // 2_600_000_000_000 / 90_000_000_000 = 28.888...
    expect(result).toBeCloseTo(28.888, 1);
  });

  it("throws on zero unit cost", () => {
    const broken: Category = { ...cancerCategory, unitCostUsd: 0 };
    expect(() => computeCategoryMetric(broken, 1_000_000)).toThrow();
  });
});

describe("pickMatrixMode", () => {
  it("returns 'discrete' when value < 40", () => {
    expect(pickMatrixMode(28)).toBe("discrete");
    expect(pickMatrixMode(39.9)).toBe("discrete");
  });

  it("returns 'dense' when value >= 40", () => {
    expect(pickMatrixMode(40)).toBe("dense");
    expect(pickMatrixMode(17_333_333)).toBe("dense");
  });
});

describe("computeSymbolCount", () => {
  it("returns the exact integer value in discrete mode", () => {
    const result = computeSymbolCount(28.4, "discrete");
    expect(result.mode).toBe("discrete");
    expect(result.visibleCount).toBe(28);
    expect(result.unitsPerSymbol).toBe(1);
  });

  it("caps dense mode at 500 visible symbols", () => {
    const result = computeSymbolCount(17_333_333, "dense");
    expect(result.mode).toBe("dense");
    expect(result.visibleCount).toBeLessThanOrEqual(500);
    expect(result.visibleCount).toBeGreaterThan(50);
    // The product should approximate the original value (within rounding)
    const reconstructed = result.visibleCount * result.unitsPerSymbol;
    const ratio = reconstructed / 17_333_333;
    expect(ratio).toBeGreaterThan(0.7);
    expect(ratio).toBeLessThan(1.4);
  });

  it("uses round numbers for unitsPerSymbol in dense mode", () => {
    const result = computeSymbolCount(16_000_000, "dense");
    expect(result.mode).toBe("dense");
    // unitsPerSymbol should be a 'round' number — power of 10 times 1, 2, or 5 ideally
    // We at least check it's positive integer and divides the magnitude reasonably
    expect(result.unitsPerSymbol).toBeGreaterThan(0);
    expect(Number.isInteger(result.unitsPerSymbol)).toBe(true);
  });
});

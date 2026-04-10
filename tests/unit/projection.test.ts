import { describe, expect, it } from "vitest";
import {
  currentSpendEstimate,
  type Projection,
  projectCurrentYearTotal,
  secondsSinceYearStart,
} from "@/lib/projection";

describe("projectCurrentYearTotal", () => {
  it("multiplies base by growth factor", () => {
    expect(projectCurrentYearTotal(1_000_000, 1.05)).toBeCloseTo(1_050_000, 5);
  });

  it("returns base when growth factor is 1", () => {
    expect(projectCurrentYearTotal(2_443_000_000_000, 1)).toBe(2_443_000_000_000);
  });
});

describe("secondsSinceYearStart", () => {
  it("returns 0 at midnight on Jan 1 UTC", () => {
    const d = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
    expect(secondsSinceYearStart(d)).toBe(0);
  });

  it("returns 86400 after one full day", () => {
    const d = new Date(Date.UTC(2026, 0, 2, 0, 0, 0));
    expect(secondsSinceYearStart(d)).toBe(86_400);
  });

  it("returns the right number at mid-year", () => {
    // July 2 at 12:00 UTC is day 183 (after 31+28+31+30+31+30+1 = 182 full days), plus 12 hours
    const d = new Date(Date.UTC(2026, 6, 2, 12, 0, 0));
    const expected = 182 * 86_400 + 12 * 3600;
    expect(secondsSinceYearStart(d)).toBe(expected);
  });
});

const projection: Projection = {
  totalUsd: 2_600_000_000_000,
  basedOnYear: 2025,
  baseAmountUsd: 2_443_000_000_000,
  growthFactor: 1.064,
  growthBasis: "test",
};

describe("currentSpendEstimate", () => {
  it("returns 0 at exactly Jan 1 midnight UTC", () => {
    const d = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
    expect(currentSpendEstimate(projection, d, 2026)).toBe(0);
  });

  it("returns approximately the full projected total at year-end", () => {
    const d = new Date(Date.UTC(2026, 11, 31, 23, 59, 59));
    const result = currentSpendEstimate(projection, d, 2026);
    expect(result).toBeGreaterThan(projection.totalUsd * 0.999);
    expect(result).toBeLessThanOrEqual(projection.totalUsd);
  });

  it("is roughly linear in time within the year", () => {
    // Around April 2 — about 1/4 through the year
    const d = new Date(Date.UTC(2026, 3, 2, 12, 0, 0));
    const result = currentSpendEstimate(projection, d, 2026);
    const fraction = result / projection.totalUsd;
    expect(fraction).toBeGreaterThan(0.24);
    expect(fraction).toBeLessThan(0.26);
  });

  it("handles leap years correctly (2028 has 366 days)", () => {
    const end = new Date(Date.UTC(2028, 11, 31, 23, 59, 59));
    const result = currentSpendEstimate(projection, end, 2028);
    expect(result).toBeGreaterThan(projection.totalUsd * 0.999);
  });

  it("never exceeds the total even if now is past the year", () => {
    const future = new Date(Date.UTC(2027, 5, 15, 0, 0, 0));
    const result = currentSpendEstimate(projection, future, 2026);
    expect(result).toBeLessThanOrEqual(projection.totalUsd);
  });
});

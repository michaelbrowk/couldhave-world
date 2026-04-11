import { describe, expect, it } from "vitest";
import { formatCompact, formatCount, formatCurrency } from "@/lib/formatters";

describe("formatCurrency", () => {
  it("formats USD in English with dollar sign", () => {
    const result = formatCurrency(2_600_000_000_000, "en");
    expect(result).toContain("$");
    expect(result).toMatch(/2[\s,.]600[\s,.]000[\s,.]000[\s,.]000/);
  });

  it("formats in German with dot thousands", () => {
    const result = formatCurrency(2_600_000_000_000, "de");
    expect(result).toMatch(/2\.600\.000\.000\.000/);
  });

  it("returns no fractional digits for integer dollars", () => {
    const result = formatCurrency(1234, "en");
    expect(result).not.toContain(".00");
  });
});

describe("formatCount", () => {
  // Large counts tick live (~1-20 per second in the UI), so they must render
  // as full integers with grouping — rounding to the nearest million would
  // make ticks imperceptible and would break mathematical consistency with
  // the hero counter (e.g. 874.8B / 60K = 14,579,665, not 15,000,000).
  it("renders large counts with full precision and grouping", () => {
    const r = formatCount(16_543_210, "en");
    expect(r).toMatch(/16[\s,.]543[\s,.]210/);
  });

  it("renders mid-range counts with full precision", () => {
    const r = formatCount(543_210, "en");
    expect(r).toMatch(/543[\s,.]210/);
  });

  // Small metrics (years of funding, "times over") need one decimal so the
  // live ticker can show gradual accumulation rather than integer jumps.
  it("renders small counts with one decimal place", () => {
    const r = formatCount(26.47, "en");
    expect(r).toMatch(/^26\.5$/);
  });

  it("renders tiny counts with one decimal place", () => {
    const r = formatCount(9.7, "en");
    expect(r).toMatch(/^9\.7$/);
  });

  it("respects locale grouping for German", () => {
    const r = formatCount(16_000_000, "de");
    expect(r).toMatch(/16\.000\.000/);
  });
});

describe("formatCompact", () => {
  it("renders 2.6 trillion as $2.6T in English", () => {
    const r = formatCompact(2_600_000_000_000, "en");
    expect(r).toMatch(/\$2\.6\s*T/i);
  });

  it("renders 916 billion as $916B in English", () => {
    const r = formatCompact(916_000_000_000, "en");
    expect(r).toMatch(/\$916\s*B/i);
  });
});

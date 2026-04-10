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
  it("rounds counts over 1M to nearest million", () => {
    const r = formatCount(16_543_210, "en");
    // 16,543,210 should round to 17,000,000 (nearest million)
    expect(r).toMatch(/17[\s,.]000[\s,.]000/);
  });

  it("rounds counts 10k-1M to nearest 10k", () => {
    const r = formatCount(543_210, "en");
    // 543,210 → 540,000 (nearest 10k)
    expect(r).toMatch(/540[\s,.]000/);
  });

  it("keeps small counts as integers", () => {
    const r = formatCount(43, "en");
    expect(r).toMatch(/^43$/);
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

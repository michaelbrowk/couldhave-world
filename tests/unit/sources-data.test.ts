import { describe, expect, it } from "vitest";
import warJson from "@/data/sources/war.json";
import tobaccoJson from "@/data/sources/tobacco.json";
import { SourceSchema } from "@/data/sources.schema";

describe("data/sources/war.json", () => {
  it("validates against the source schema", () => {
    const parsed = SourceSchema.parse(warJson);
    expect(parsed.id).toBe("war");
  });

  it("has the SIPRI 2025 actual figure in historical", () => {
    const parsed = SourceSchema.parse(warJson);
    const y2025 = parsed.historical?.find((h) => h.year === 2025);
    expect(y2025?.totalUsd).toBe(2_887_000_000_000);
    expect(y2025?.actual).toBe(true);
  });

  it("projects 2026 between $3.05T and $3.15T", () => {
    const parsed = SourceSchema.parse(warJson);
    expect(parsed.projection.totalUsd).toBeGreaterThan(3_050_000_000_000);
    expect(parsed.projection.totalUsd).toBeLessThan(3_150_000_000_000);
  });

  it("ships at least 10 alternative categories", () => {
    const parsed = SourceSchema.parse(warJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(10);
  });
});

describe("data/sources/tobacco.json", () => {
  it("validates against the source schema", () => {
    const parsed = SourceSchema.parse(tobaccoJson);
    expect(parsed.id).toBe("tobacco");
  });

  it("uses a flat $1.7T/year (no growth)", () => {
    const parsed = SourceSchema.parse(tobaccoJson);
    expect(parsed.projection.totalUsd).toBe(1_700_000_000_000);
    expect(parsed.projection.totalUsd).toBe(parsed.projection.baseAmountUsd);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships at least 6 alternative categories", () => {
    const parsed = SourceSchema.parse(tobaccoJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(6);
  });
});

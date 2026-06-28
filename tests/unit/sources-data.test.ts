import { describe, expect, it } from "vitest";
import warJson from "@/data/sources/war.json";
import tobaccoJson from "@/data/sources/tobacco.json";
import fossilJson from "@/data/sources/fossil-fuels.json";
import foodWasteJson from "@/data/sources/food-waste.json";
import advertisingJson from "@/data/sources/advertising.json";
import gamblingJson from "@/data/sources/gambling.json";
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

  it("uses a flat $1.4T/year (no growth)", () => {
    const parsed = SourceSchema.parse(tobaccoJson);
    expect(parsed.projection.totalUsd).toBe(1_400_000_000_000);
    expect(parsed.projection.totalUsd).toBe(parsed.projection.baseAmountUsd);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships at least 6 alternative categories", () => {
    const parsed = SourceSchema.parse(tobaccoJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(6);
  });
});

describe("data/sources/fossil-fuels.json", () => {
  it("validates against the source schema", () => {
    const parsed = SourceSchema.parse(fossilJson);
    expect(parsed.id).toBe("fossil-fuels");
  });

  it("uses a flat $7.4T/year (explicit + implicit)", () => {
    const parsed = SourceSchema.parse(fossilJson);
    expect(parsed.projection.totalUsd).toBe(7_400_000_000_000);
    expect(parsed.projection.totalUsd).toBe(parsed.projection.baseAmountUsd);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships at least 6 alternative categories", () => {
    const parsed = SourceSchema.parse(fossilJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(6);
  });
});

describe("data/sources/food-waste.json", () => {
  it("validates against the source schema", () => {
    const parsed = SourceSchema.parse(foodWasteJson);
    expect(parsed.id).toBe("food-waste");
  });

  it("uses a flat $1T/year (no growth)", () => {
    const parsed = SourceSchema.parse(foodWasteJson);
    expect(parsed.projection.totalUsd).toBe(1_000_000_000_000);
    expect(parsed.projection.totalUsd).toBe(parsed.projection.baseAmountUsd);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships at least 6 alternative categories", () => {
    const parsed = SourceSchema.parse(foodWasteJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(6);
  });
});

describe("data/sources/advertising.json", () => {
  it("validates against the source schema", () => {
    const parsed = SourceSchema.parse(advertisingJson);
    expect(parsed.id).toBe("advertising");
  });

  it("uses a flat $1.3T/year (no growth)", () => {
    const parsed = SourceSchema.parse(advertisingJson);
    expect(parsed.projection.totalUsd).toBe(1_300_000_000_000);
    expect(parsed.projection.totalUsd).toBe(parsed.projection.baseAmountUsd);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships at least 6 alternative categories", () => {
    const parsed = SourceSchema.parse(advertisingJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(6);
  });
});

describe("data/sources/gambling.json", () => {
  it("validates against the source schema", () => {
    const parsed = SourceSchema.parse(gamblingJson);
    expect(parsed.id).toBe("gambling");
  });

  it("uses a flat $573B/year (no growth)", () => {
    const parsed = SourceSchema.parse(gamblingJson);
    expect(parsed.projection.totalUsd).toBe(573_000_000_000);
    expect(parsed.projection.totalUsd).toBe(parsed.projection.baseAmountUsd);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships at least 6 alternative categories", () => {
    const parsed = SourceSchema.parse(gamblingJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(6);
  });
});

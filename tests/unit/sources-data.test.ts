import { describe, expect, it } from "vitest";
import advertisingJson from "@/data/sources/advertising.json";
import foodWasteJson from "@/data/sources/food-waste.json";
import fossilJson from "@/data/sources/fossil-fuels.json";
import gamblingJson from "@/data/sources/gambling.json";
import tobaccoJson from "@/data/sources/tobacco.json";
import warJson from "@/data/sources/war.json";
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

  it("uses the 2025 actual as an explicitly flat benchmark", () => {
    const parsed = SourceSchema.parse(warJson);
    expect(parsed.projection.totalUsd).toBe(2_887_000_000_000);
    expect(parsed.projection.basedOnYear).toBe(2025);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships supported alternatives", () => {
    const parsed = SourceSchema.parse(warJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(1);
  });
});

describe("data/sources/tobacco.json", () => {
  it("validates against the source schema", () => {
    const parsed = SourceSchema.parse(tobaccoJson);
    expect(parsed.id).toBe("tobacco");
  });

  it("uses a flat $1.436T/year (no growth)", () => {
    const parsed = SourceSchema.parse(tobaccoJson);
    expect(parsed.projection.totalUsd).toBe(1_436_000_000_000);
    expect(parsed.projection.totalUsd).toBe(parsed.projection.baseAmountUsd);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships supported alternatives", () => {
    const parsed = SourceSchema.parse(tobaccoJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(1);
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

  it("ships supported alternatives", () => {
    const parsed = SourceSchema.parse(fossilJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(1);
  });
});

describe("data/sources/food-waste.json", () => {
  it("validates against the source schema", () => {
    const parsed = SourceSchema.parse(foodWasteJson);
    expect(parsed.id).toBe("food-waste");
  });

  it("uses a flat $936B/year (no growth)", () => {
    const parsed = SourceSchema.parse(foodWasteJson);
    expect(parsed.projection.totalUsd).toBe(936_000_000_000);
    expect(parsed.projection.totalUsd).toBe(parsed.projection.baseAmountUsd);
    expect(parsed.projection.growthFactor).toBeUndefined();
  });

  it("ships supported alternatives", () => {
    const parsed = SourceSchema.parse(foodWasteJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(1);
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

  it("ships supported alternatives", () => {
    const parsed = SourceSchema.parse(advertisingJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(1);
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

  it("ships supported alternatives", () => {
    const parsed = SourceSchema.parse(gamblingJson);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(1);
  });
});

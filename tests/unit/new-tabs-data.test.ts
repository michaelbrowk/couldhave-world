import { describe, expect, it } from "vitest";
import { SOURCES } from "@/data/sources.index";

const findCat = (sid: keyof typeof SOURCES, cid: string) =>
  SOURCES[sid].categories.find((c) => c.id === cid);

describe("canonical values — food-waste tab", () => {
  it("headline retains the historical FAO $936B benchmark", () => {
    expect(SOURCES["food-waste"].projection.totalUsd).toBe(936_000_000_000);
  });

  it("clean-water is the $37.6B drinking-water-only figure", () => {
    expect(findCat("food-waste", "clean-water")?.unitCostUsd).toBe(37_600_000_000);
  });

  it("world-hunger is $33B", () => {
    expect(findCat("food-waste", "world-hunger")?.unitCostUsd).toBe(33_000_000_000);
  });
});

describe("canonical values — advertising tab", () => {
  it("headline total is $1.3 trillion", () => {
    expect(SOURCES.advertising.projection.totalUsd).toBe(1_300_000_000_000);
  });

  it("clean-water is the $37.6B drinking-water-only figure", () => {
    expect(findCat("advertising", "clean-water")?.unitCostUsd).toBe(37_600_000_000);
  });

  it("world-hunger is $33B", () => {
    expect(findCat("advertising", "world-hunger")?.unitCostUsd).toBe(33_000_000_000);
  });

  it("child-vaccination is the IA2030 model average ($26.98B)", () => {
    expect(findCat("advertising", "child-vaccination")?.unitCostUsd).toBe(26_980_000_000);
  });
});

describe("canonical values — gambling tab", () => {
  it("headline total is $573B", () => {
    expect(SOURCES.gambling.projection.totalUsd).toBe(573_000_000_000);
  });

  it("clean-water is the $37.6B drinking-water-only figure", () => {
    expect(findCat("gambling", "clean-water")?.unitCostUsd).toBe(37_600_000_000);
  });

  it("world-hunger is $33B", () => {
    expect(findCat("gambling", "world-hunger")?.unitCostUsd).toBe(33_000_000_000);
  });

  it("does not treat PPP international dollars as transferable USD", () => {
    expect(findCat("gambling", "extreme-poverty")).toBeUndefined();
  });
});

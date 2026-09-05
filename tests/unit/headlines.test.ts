import { describe, expect, it } from "vitest";
import { SOURCES } from "@/data/sources.index";

describe("corrected headlines", () => {
  it("tobacco retains the 2012 study value", () => {
    expect(SOURCES.tobacco.projection.totalUsd).toBe(1_436_000_000_000);
  });
  it("ai is re-based to Big-5 ~$770B", () => {
    expect(SOURCES.ai.projection.totalUsd).toBe(770_000_000_000);
    expect(SOURCES.ai.projection.baseAmountUsd).toBe(448_232_000_000);
  });
});

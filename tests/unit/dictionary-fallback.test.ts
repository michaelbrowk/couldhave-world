import { describe, expect, it } from "vitest";
import { getDictionary } from "@/app/[locale]/dictionaries";

describe("dictionary EN fallback", () => {
  it("returns EN value for keys missing in DE", async () => {
    const de = await getDictionary("de");
    expect(de.sources.war.label).toBeDefined();
    expect(de.sources.war.label.length).toBeGreaterThan(0);
  });

  it("does not break existing top-level keys when they exist locally", async () => {
    const de = await getDictionary("de");
    expect(de.hero.caption).toBeDefined();
  });
});

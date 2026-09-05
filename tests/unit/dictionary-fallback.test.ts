import { describe, expect, it } from "vitest";
import { getDictionary } from "@/app/[locale]/dictionaries";
import enDict from "@/messages/en.json";

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

describe("sources dictionary blocks", () => {
  it("en.json sources['food-waste'] has string label/caption/rate/methodology", () => {
    const fw = (enDict as { sources: { "food-waste": Record<string, unknown> } }).sources[
      "food-waste"
    ];
    expect(fw).toBeDefined();
    expect(typeof fw.label).toBe("string");
    expect(typeof fw.caption).toBe("string");
    expect(typeof fw.rate).toBe("string");
    expect(typeof fw.methodology).toBe("string");
  });

  it("en.json sources['advertising'] has string label/caption/rate/methodology", () => {
    const adv = (enDict as { sources: { advertising: Record<string, unknown> } }).sources
      .advertising;
    expect(adv).toBeDefined();
    expect(typeof adv.label).toBe("string");
    expect(typeof adv.caption).toBe("string");
    expect(typeof adv.rate).toBe("string");
    expect(typeof adv.methodology).toBe("string");
  });

  it("en.json sources['gambling'] has string label/caption/rate/methodology", () => {
    const g = (enDict as { sources: { gambling: Record<string, unknown> } }).sources.gambling;
    expect(g).toBeDefined();
    expect(typeof g.label).toBe("string");
    expect(typeof g.caption).toBe("string");
    expect(typeof g.rate).toBe("string");
    expect(typeof g.methodology).toBe("string");
  });
});

describe("ai dictionary", () => {
  it("has sources.ai with label, caption, rate, methodology as strings", () => {
    const ai = (enDict as { sources: { ai: Record<string, unknown> } }).sources.ai;
    expect(ai).toBeDefined();
    expect(typeof ai.label).toBe("string");
    expect(typeof ai.caption).toBe("string");
    expect(typeof ai.rate).toBe("string");
    expect(typeof ai.methodology).toBe("string");
  });

  it("has categories.ai with label and supported short keys, each with title and unit strings", () => {
    const ai = (
      enDict as {
        categories: {
          ai: {
            label: string;
            [key: string]: string | { title: string; unit: string };
          };
        };
      }
    ).categories.ai;
    expect(ai).toBeDefined();
    expect(typeof ai.label).toBe("string");

    const shortKeys = [
      "dotcom",
      "apollo",
      "manhattan",
      "hunger",
      "water",
      "malaria",
      "grid",
    ] as const;

    for (const key of shortKeys) {
      const entry = ai[key];
      expect(entry, `categories.ai.${key}`).toBeDefined();
      expect(typeof entry).toBe("object");
      const obj = entry as { title: string; unit: string };
      expect(typeof obj.title).toBe("string");
      expect(obj.title.length).toBeGreaterThan(0);
      expect(typeof obj.unit).toBe("string");
      expect(obj.unit.length).toBeGreaterThan(0);
    }
  });
});

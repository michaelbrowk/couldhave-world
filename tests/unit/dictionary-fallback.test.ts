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

describe("ai dictionary", () => {
  it("has sources.ai with label, caption, rate, methodology as strings", () => {
    const ai = (enDict as { sources: { ai: Record<string, unknown> } }).sources.ai;
    expect(ai).toBeDefined();
    expect(typeof ai.label).toBe("string");
    expect(typeof ai.caption).toBe("string");
    expect(typeof ai.rate).toBe("string");
    expect(typeof ai.methodology).toBe("string");
  });

  it("has categories.ai with label and 8 short keys, each with title and unit strings", () => {
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
      "aiRevenue",
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

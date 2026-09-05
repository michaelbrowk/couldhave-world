import { describe, expect, it } from "vitest";
import { getCategoryDictKey } from "@/app/[locale]/dictionaries";
import { SOURCES, SOURCES_LIST } from "@/data/sources.index";
import { SourceSchema } from "@/data/sources.schema";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";

describe("audited evidence contracts", () => {
  for (const id of [
    "world-hunger",
    "clean-water",
    "child-vaccination",
    "malaria-control",
    "utility-solar-gw",
  ]) {
    it(`${id} uses a consistent denominator across every tab`, () => {
      const rows = SOURCES_LIST.flatMap((s) => s.categories.filter((c) => c.id === id));
      expect(rows.length).toBeGreaterThan(1);
      expect(new Set(rows.map((c) => c.unitCostUsd)).size).toBe(1);
      expect(new Set(rows.map((c) => c.scaleHint)).size).toBe(1);
    });
  }
  for (const [locale, dict] of Object.entries({ en, es, de, fr })) {
    it(`${locale} has explicit translated denominator labels without relying on fallback`, () => {
      const categories = dict.categories as unknown as Record<
        string,
        Record<string, { title: string; unit: string; compareUnit: string }>
      >;
      for (const source of SOURCES_LIST)
        for (const category of source.categories) {
          const key = getCategoryDictKey(source.id, category.id);
          const entry = categories[source.id]?.[key];
          expect(entry?.title, `${source.id}/${key}`).toBeTruthy();
          expect(entry?.unit, `${source.id}/${key}`).toBeTruthy();
          expect(
            entry?.compareUnit,
            `${source.id}/${key} must label the cost denominator`,
          ).toBeTruthy();
        }
    });
  }
  it("rejects duplicate comparisons and ambiguous repeated historical years", () => {
    const source = structuredClone(SOURCES.ai);
    source.categories.push(...source.categories.slice(0, 1));
    expect(SourceSchema.safeParse(source).success).toBe(false);
    const history = structuredClone(SOURCES.ai);
    history.historical?.push(...history.historical.slice(0, 1));
    expect(SourceSchema.safeParse(history).success).toBe(false);
  });
  it("rejects a future baseline and inconsistent compounded totals", () => {
    const source = structuredClone(SOURCES.ai);
    source.projection.basedOnYear = source.currentYear + 1;
    expect(SourceSchema.safeParse(source).success).toBe(false);
    const badMath = structuredClone(SOURCES.ai);
    badMath.projection.totalUsd *= 2;
    expect(SourceSchema.safeParse(badMath).success).toBe(false);
  });
  it("permits fewer supported comparisons instead of requiring unsupported filler", () => {
    const source = structuredClone(SOURCES.ai);
    source.categories = source.categories.slice(0, 1);
    expect(SourceSchema.safeParse(source).success).toBe(true);
  });
});

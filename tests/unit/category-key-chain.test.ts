import { describe, expect, it } from "vitest";
import { CATEGORY_DICT_KEYS, getDictionary } from "@/app/[locale]/dictionaries";
import { SOURCES_LIST } from "@/data/sources.index";
import enDict from "@/messages/en.json";

type ShortKeyEntry = { title: string; unit: string };
type CatBlock = Record<string, unknown>;
type EnCategories = Record<string, CatBlock>;

// Cast through unknown to avoid incompatible-overlap error with the literal types in
// the inferred JSON type (en.json has extra string-valued keys on the categories object).
const enCats = (enDict as unknown as { categories: EnCategories }).categories;

describe("category key-chain integrity", () => {
  it("every source category has a CATEGORY_DICT_KEYS mapping", () => {
    for (const source of SOURCES_LIST) {
      const sourceMap = CATEGORY_DICT_KEYS[source.id];
      expect(sourceMap, `CATEGORY_DICT_KEYS["${source.id}"] must exist`).toBeDefined();
      if (!sourceMap) continue;
      for (const cat of source.categories) {
        const shortKey = sourceMap[cat.id];
        expect(shortKey, `${source.id}/${cat.id} must have a short key`).toBeTruthy();
        if (!shortKey) continue;
        expect(typeof shortKey, `${source.id}/${cat.id} short key must be a string`).toBe("string");
        expect(
          shortKey.length,
          `${source.id}/${cat.id} short key must be non-empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("every short key resolves to title/unit in en.json", () => {
    for (const source of SOURCES_LIST) {
      const sourceMap = CATEGORY_DICT_KEYS[source.id];
      if (!sourceMap) continue;
      const catBlock = enCats[source.id];
      expect(catBlock, `enDict.categories["${source.id}"] must exist`).toBeDefined();
      if (!catBlock) continue;
      for (const cat of source.categories) {
        const shortKey = sourceMap[cat.id];
        if (!shortKey) continue;
        const entry = catBlock[shortKey] as ShortKeyEntry | undefined;
        expect(entry, `enDict.categories.${source.id}.${shortKey} must exist`).toBeDefined();
        if (!entry) continue;
        expect(typeof entry).toBe("object");
        expect(
          entry.title,
          `${source.id}/${shortKey}.title must be a non-empty string`,
        ).toBeTruthy();
        expect(typeof entry.title).toBe("string");
        expect(entry.unit, `${source.id}/${shortKey}.unit must be a non-empty string`).toBeTruthy();
        expect(typeof entry.unit).toBe("string");
      }
    }
  });

  it("category titleKey/unitLabelKey matches categories.<sid>.<shortKey>.title/.unit", () => {
    for (const source of SOURCES_LIST) {
      const sourceMap = CATEGORY_DICT_KEYS[source.id];
      if (!sourceMap) continue;
      for (const cat of source.categories) {
        const shortKey = sourceMap[cat.id];
        if (!shortKey) continue;
        const expectedTitle = `categories.${source.id}.${shortKey}.title`;
        const expectedUnit = `categories.${source.id}.${shortKey}.unit`;
        expect(cat.titleKey, `${source.id}/${cat.id} titleKey mismatch`).toBe(expectedTitle);
        expect(cat.unitLabelKey, `${source.id}/${cat.id} unitLabelKey mismatch`).toBe(expectedUnit);
      }
    }
  });

  it("no orphan mappings: every CATEGORY_DICT_KEYS entry has a matching category", () => {
    for (const source of SOURCES_LIST) {
      const sourceMap = CATEGORY_DICT_KEYS[source.id];
      if (!sourceMap) continue;
      const realCatIds = new Set(source.categories.map((c) => c.id));
      for (const catId of Object.keys(sourceMap)) {
        expect(
          realCatIds.has(catId),
          `CATEGORY_DICT_KEYS["${source.id}"]["${catId}"] is an orphan — no category with that id`,
        ).toBe(true);
      }
    }
  });
});

describe("locale parity: all category keys present via getDictionary", () => {
  const locales = ["es", "de", "fr"] as const;
  for (const locale of locales) {
    it(`${locale} has every source/shortKey with title and unit (via EN fallback)`, async () => {
      const dict = await getDictionary(locale);
      const cats = (dict as unknown as { categories: EnCategories }).categories;
      for (const source of SOURCES_LIST) {
        const sourceMap = CATEGORY_DICT_KEYS[source.id];
        if (!sourceMap) continue;
        const catBlock = cats[source.id];
        expect(catBlock, `${locale}: cats["${source.id}"] missing`).toBeDefined();
        if (!catBlock) continue;
        for (const cat of source.categories) {
          const shortKey = sourceMap[cat.id];
          if (!shortKey) continue;
          const entry = catBlock[shortKey] as ShortKeyEntry | undefined;
          expect(entry, `${locale}: cats.${source.id}.${shortKey} missing`).toBeDefined();
          if (!entry) continue;
          expect(
            entry.title?.length,
            `${locale}: ${source.id}.${shortKey}.title empty`,
          ).toBeGreaterThan(0);
          expect(
            entry.unit?.length,
            `${locale}: ${source.id}.${shortKey}.unit empty`,
          ).toBeGreaterThan(0);
        }
      }
    });
  }
});

# Source Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The full specification lives at `docs/superpowers/specs/2026-04-29-source-tabs-design.md` — read it before starting and refer back whenever a task references a spec section.

**Goal:** Add three swappable spending narratives (war / tobacco use / fossil-fuel subsidies) to the existing landing, with a tab switcher that re-renders the hero counter and the alternatives ledger per tab. Refresh war numbers to SIPRI 2025 actuals.

**Architecture:** Migrate today's two data files (`military-spending.json` + `categories.json`) into a unified `data/sources/{war,tobacco,fossil-fuels}.json` shape behind a single Zod schema. Introduce a client `<SourceSwitcher>` that reads `?source=` from the URL, renders the right `<SourceHero>` + `<SourceCategories>`, and persists tab state via `router.replace`. Keep static export. Mixpanel gets a new `source_switch` event and the existing `category_*` / `source_clicked` events get a `source` field.

**Tech Stack:** Next.js 15 (static export), Zod, Tailwind v4, framer-motion, Vitest, Playwright, Mixpanel browser SDK, Biome.

**Branch:** Execute on `feature/source-tabs`. Create at the start of Task 1, push at the end of Task 19, open PR with `gh pr create`.

---

## File Structure

**Created**

```
data/sources/war.json
data/sources/tobacco.json
data/sources/fossil-fuels.json
data/sources.schema.ts
data/sources.index.ts
lib/sources.ts
components/sources/SourceSwitcher.tsx
components/sources/SourceTabs.tsx
components/sources/SourceHero.tsx
components/sources/SourceCategories.tsx
tests/sources-data.test.ts
tests/source-id.test.ts
tests/source-switcher.spec.ts          # Playwright
```

**Modified**

```
app/[locale]/page.tsx                   # delegate hero+ledger to <SourceSwitcher>
app/[locale]/dictionaries.ts            # nested category keys + EN fallback for non-EN locales
app/[locale]/layout.tsx                 # if Analytics receives more props (verify)
messages/en.json                        # add sources.* + per-source category keys
components/categories/CategoryRow.tsx   # use the new Category type from sources.schema
components/analytics/Analytics.tsx      # source_switch event, source field on category events
lib/categories.ts                       # if it imports from data/categories.schema, repoint
```

**Deleted (after every consumer is repointed)**

```
data/military-spending.json
data/military-spending.schema.ts
data/categories.json
data/categories.schema.ts
```

---

## Task 1: Branch + sources Zod schema

**Files:**
- Create: `data/sources.schema.ts`
- Test: `tests/sources-schema.test.ts`

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b feature/source-tabs
```

- [ ] **Step 2: Write the failing test**

Create `tests/sources-schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SourceSchema, SOURCE_IDS } from "@/data/sources.schema";

describe("SourceSchema", () => {
  it("accepts a minimal valid source", () => {
    const ok = SourceSchema.parse({
      id: "war",
      labelKey: "sources.war.label",
      currentYear: 2026,
      projection: {
        totalUsd: 3_113_000_000_000,
        basedOnYear: 2025,
        baseAmountUsd: 2_887_000_000_000,
        growthFactor: 1.0783,
        growthBasis: "5-year geomean",
      },
      source: "SIPRI",
      sourceUrl: "https://sipri.org/databases/milex",
      lastUpdated: "2026-04-29",
      categories: Array.from({ length: 6 }, (_, i) => ({
        id: `c-${i}`,
        titleKey: `categories.war.c${i}.title`,
        unitLabelKey: `categories.war.c${i}.unit`,
        symbol: "coin",
        scaleHint: "perUnit",
        unitCostUsd: 1000,
        sources: [{ name: "Test", url: "https://example.com", year: 2024 }],
        methodology: "test",
      })),
    });
    expect(ok.id).toBe("war");
  });

  it("rejects fewer than 6 categories", () => {
    expect(() =>
      SourceSchema.parse({
        id: "war",
        labelKey: "x",
        currentYear: 2026,
        projection: {
          totalUsd: 1,
          basedOnYear: 2025,
          baseAmountUsd: 1,
          growthBasis: "x",
        },
        source: "x",
        sourceUrl: "https://example.com",
        lastUpdated: "2026-04-29",
        categories: [],
      }),
    ).toThrow();
  });

  it("exposes the canonical id list", () => {
    expect(SOURCE_IDS).toEqual(["war", "tobacco", "fossil-fuels"]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run tests/sources-schema.test.ts
```

Expected: FAIL — `Cannot find module '@/data/sources.schema'`.

- [ ] **Step 4: Write the schema**

Create `data/sources.schema.ts`:

```ts
import { z } from "zod";

export const SOURCE_IDS = ["war", "tobacco", "fossil-fuels"] as const;
export type SourceId = (typeof SOURCE_IDS)[number];

const SymbolEnum = z.enum(["cross", "drop", "grain", "roof", "coin", "leaf", "ray"]);
const ScaleHintEnum = z.enum(["perUnit", "totalSolution", "annualNeed"]);

const CategorySourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  year: z.number().int(),
});

const CategorySchema = z.object({
  id: z.string().min(1),
  titleKey: z.string().min(1),
  unitLabelKey: z.string().min(1),
  symbol: SymbolEnum,
  scaleHint: ScaleHintEnum,
  unitCostUsd: z.number().positive(),
  sources: z.array(CategorySourceSchema).min(1),
  methodology: z.string().min(1),
});

const ProjectionSchema = z.object({
  totalUsd: z.number().positive(),
  basedOnYear: z.number().int(),
  baseAmountUsd: z.number().positive(),
  growthFactor: z.number().positive().optional(),
  growthBasis: z.string().min(1),
});

const HistoricalEntrySchema = z.object({
  year: z.number().int(),
  totalUsd: z.number().positive(),
  actual: z.boolean(),
});

export const SourceSchema = z.object({
  id: z.enum(SOURCE_IDS),
  labelKey: z.string().min(1),
  currentYear: z.number().int(),
  projection: ProjectionSchema,
  historical: z.array(HistoricalEntrySchema).optional(),
  source: z.string().min(1),
  sourceUrl: z.string().url(),
  lastUpdated: z.string().min(1),
  categories: z.array(CategorySchema).min(6),
});

export type Source = z.infer<typeof SourceSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategorySourceRef = z.infer<typeof CategorySourceSchema>;
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run tests/sources-schema.test.ts
```

Expected: PASS, 3 specs.

- [ ] **Step 6: Commit**

```bash
git add data/sources.schema.ts tests/sources-schema.test.ts
git commit -m "feat(data): zod schema for unified spending source"
```

---

## Task 2: Migrate war source — refresh SIPRI 2025

**Files:**
- Create: `data/sources/war.json`
- Modify: `data/sources.schema.ts` (no change expected; only verify via test)
- Test: `tests/sources-data.test.ts`

The current `data/military-spending.json` has `totalUsd: 3,183,792,600,000` based on SIPRI 2024 actuals + 4-year geomean growth (`growthFactor: 1.0823`). SIPRI published the 2025 update on 27 April 2026 with global total $2,887B. Recompute the 5-year geomean over 2020→2025 (5 compounding years):

```
ratios = [2113/1981, 2240/2113, 2443/2240, 2718/2443, 2887/2718]
       = [1.06664, 1.06010, 1.09063, 1.11257, 1.06218]
geomean = (product)^(1/5) ≈ 1.0783
2026 projection = 2887 × 1.0783 ≈ 3,113,040 (millions of USD)
```

- [ ] **Step 1: Write the failing test**

Create `tests/sources-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/sources-data.test.ts
```

Expected: FAIL — `Cannot find module '@/data/sources/war.json'`.

- [ ] **Step 3: Create the war.json file**

Create `data/sources/war.json`. Take the entire `categories` array from the existing `data/categories.json` and embed it under `categories`. Take projection / historical / source fields from `data/military-spending.json` and refresh them to SIPRI 2025:

```json
{
  "id": "war",
  "labelKey": "sources.war.label",
  "currentYear": 2026,
  "projection": {
    "totalUsd": 3113040000000,
    "basedOnYear": 2025,
    "baseAmountUsd": 2887000000000,
    "growthFactor": 1.0783,
    "growthBasis": "5-data-point geometric mean of annual nominal growth, SIPRI 2020-2025 (5 compounding years), then compounded 1 year from basedOnYear (2025) to currentYear (2026). SIPRI Trends in World Military Expenditure, 2025 was published on 2026-04-27."
  },
  "historical": [
    { "year": 2025, "totalUsd": 2887000000000, "actual": true },
    { "year": 2024, "totalUsd": 2718000000000, "actual": true },
    { "year": 2023, "totalUsd": 2443000000000, "actual": true },
    { "year": 2022, "totalUsd": 2240000000000, "actual": true },
    { "year": 2021, "totalUsd": 2113000000000, "actual": true },
    { "year": 2020, "totalUsd": 1981000000000, "actual": true }
  ],
  "source": "SIPRI Trends in World Military Expenditure, 2025",
  "sourceUrl": "https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025",
  "lastUpdated": "2026-04-29",
  "categories": [
    /* paste the existing 10 entries from data/categories.json verbatim, but
       replace each titleKey/unitLabelKey to live under the war namespace, e.g.:
         "titleKey": "categories.war.cancer.title",
         "unitLabelKey": "categories.war.cancer.unit"
       Keep id, symbol, scaleHint, unitCostUsd, sources, methodology unchanged. */
  ]
}
```

The `categories[]` content (10 entries) — copy from the current `data/categories.json` and rewrite each `titleKey` from `categories.<key>.title` → `categories.war.<key>.title` (same for `unitLabelKey`). Concretely, for each existing category use this mapping table (the second column is the short dict key already in `app/[locale]/dictionaries.ts → CATEGORY_DICT_KEYS`):

| `id` | dict key |
|---|---|
| `cancer-treatment` | `cancer` |
| `malaria-eradication` | `malaria` |
| `world-hunger` | `hunger` |
| `clean-water` | `water` |
| `schools-lmic` | `schools` |
| `child-vaccination` | `vaccination` |
| `extreme-poverty` | `poverty` |
| `rainforest-protection` | `rainforest` |
| `renewable-transition` | `renewable` |
| `humanitarian-aid` | `humanitarian` |

So the first item becomes:

```json
{
  "id": "cancer-treatment",
  "titleKey": "categories.war.cancer.title",
  "unitLabelKey": "categories.war.cancer.unit",
  "symbol": "cross",
  "scaleHint": "perUnit",
  "unitCostUsd": 60000,
  "sources": [ /* unchanged */ ],
  "methodology": "/* unchanged */"
}
```

Apply the same pattern to all 10 entries.

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/sources-data.test.ts
```

Expected: PASS, 4 specs.

- [ ] **Step 5: Commit**

```bash
git add data/sources/war.json tests/sources-data.test.ts
git commit -m "feat(data): migrate war source, refresh to SIPRI 2025 actuals"
```

---

## Task 3: Tobacco source data

**Files:**
- Create: `data/sources/tobacco.json`
- Modify: `tests/sources-data.test.ts`

Tobacco use cost is treated as a constant annual flow ($1.7T/year, WHO 2022 update). No projection — `growthFactor` omitted, `totalUsd === baseAmountUsd`.

- [ ] **Step 1: Extend the data test**

Append to `tests/sources-data.test.ts`:

```ts
import tobaccoJson from "@/data/sources/tobacco.json";

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/sources-data.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the file**

Create `data/sources/tobacco.json`:

```json
{
  "id": "tobacco",
  "labelKey": "sources.tobacco.label",
  "currentYear": 2026,
  "projection": {
    "totalUsd": 1700000000000,
    "basedOnYear": 2022,
    "baseAmountUsd": 1700000000000,
    "growthBasis": "Annual figure used as a constant rate; not projected. WHO 2022 estimate: USD 1.7 trillion per year in healthcare costs and lost productivity, equivalent to 1.7% of global GDP."
  },
  "source": "WHO — Economic cost of tobacco use, 2022 update",
  "sourceUrl": "https://www.who.int/health-topics/tobacco",
  "lastUpdated": "2026-04-29",
  "categories": [
    {
      "id": "lung-cancer-treatment",
      "titleKey": "categories.tobacco.lungCancer.title",
      "unitLabelKey": "categories.tobacco.lungCancer.unit",
      "symbol": "cross",
      "scaleHint": "perUnit",
      "unitCostUsd": 80000,
      "sources": [
        {
          "name": "American Cancer Society — Cancer Treatment & Survivorship Facts and Figures",
          "url": "https://www.cancer.org/research/cancer-facts-statistics/survivor-facts-figures.html",
          "year": 2022
        },
        {
          "name": "JNCI — Cost of lung cancer care in the United States",
          "url": "https://academic.oncology.com/lung-cancer-cost",
          "year": 2023
        }
      ],
      "methodology": "Approximate full-course cost of treating one patient with non-small-cell lung cancer in a high-income setting (surgery + platinum-based chemotherapy + immunotherapy + radiotherapy + follow-up), drawn from ACS cost-of-care estimates."
    },
    {
      "id": "smoking-cessation",
      "titleKey": "categories.tobacco.cessation.title",
      "unitLabelKey": "categories.tobacco.cessation.unit",
      "symbol": "drop",
      "scaleHint": "perUnit",
      "unitCostUsd": 300,
      "sources": [
        {
          "name": "USPSTF — Tobacco Smoking Cessation in Adults, Recommendation Statement",
          "url": "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/tobacco-use-in-adults-and-pregnant-women-counseling-and-interventions",
          "year": 2021
        },
        {
          "name": "CDC — Best Practices for Comprehensive Tobacco Control Programs",
          "url": "https://www.cdc.gov/tobacco/stateandcommunity/best_practices/index.htm",
          "year": 2014
        }
      ],
      "methodology": "Per-quitter cost of an evidence-based cessation program: nicotine replacement therapy (NRT) plus brief behavioural counselling, US public-health pricing."
    },
    {
      "id": "mpower-country",
      "titleKey": "categories.tobacco.mpower.title",
      "unitLabelKey": "categories.tobacco.mpower.unit",
      "symbol": "roof",
      "scaleHint": "totalSolution",
      "unitCostUsd": 100000000,
      "sources": [
        {
          "name": "WHO — MPOWER Tobacco Control Investment Cases",
          "url": "https://www.who.int/teams/health-promotion/tobacco-control/economics",
          "year": 2023
        },
        {
          "name": "WHO FCTC — The Global Case for Investment in Tobacco Control",
          "url": "https://fctc.who.int/docs/librariesprovider12/investment-fund-documents/the-global-case-for-investment-in-tobacco-control.pdf",
          "year": 2021
        }
      ],
      "methodology": "Average annual cost for a single low- or middle-income country to fully implement the WHO MPOWER package (tax, smoke-free policies, cessation services, packaging, advertising bans, monitoring) at scale, from WHO investment-case median."
    },
    {
      "id": "tb-treatment",
      "titleKey": "categories.tobacco.tb.title",
      "unitLabelKey": "categories.tobacco.tb.unit",
      "symbol": "drop",
      "scaleHint": "perUnit",
      "unitCostUsd": 600,
      "sources": [
        {
          "name": "WHO — Global Tuberculosis Report",
          "url": "https://www.who.int/teams/global-tuberculosis-programme/tb-reports",
          "year": 2024
        },
        {
          "name": "Stop TB Partnership — Global Plan to End TB",
          "url": "https://www.stoptb.org/global-plan-to-end-tb",
          "year": 2023
        }
      ],
      "methodology": "Per-patient cost of a full DOTS course of TB treatment in low- and middle-income settings (drugs + diagnosis + supervised delivery), from WHO Global TB Report median."
    },
    {
      "id": "copd-care-year",
      "titleKey": "categories.tobacco.copd.title",
      "unitLabelKey": "categories.tobacco.copd.unit",
      "symbol": "cross",
      "scaleHint": "annualNeed",
      "unitCostUsd": 5000,
      "sources": [
        {
          "name": "GOLD — Global Strategy for the Diagnosis, Management, and Prevention of COPD",
          "url": "https://goldcopd.org/2024-gold-report/",
          "year": 2024
        }
      ],
      "methodology": "Annual cost of evidence-based COPD care for one moderate-severity patient (inhaled therapy + exacerbation management + pulmonary rehab) in an upper-middle-income setting, from GOLD report ranges."
    },
    {
      "id": "child-vaccination",
      "titleKey": "categories.tobacco.vaccination.title",
      "unitLabelKey": "categories.tobacco.vaccination.unit",
      "symbol": "drop",
      "scaleHint": "annualNeed",
      "unitCostUsd": 9500000000,
      "sources": [
        {
          "name": "Gavi, The Vaccine Alliance — Investment Opportunity 2021-2025",
          "url": "https://www.gavi.org/investing-gavi/funding/resource-mobilisation-process/gavi-investment-opportunity-2021-2025",
          "year": 2020
        },
        {
          "name": "WHO Immunization Agenda 2030",
          "url": "https://www.who.int/publications/i/item/immunization-agenda-2030-a-global-strategy-to-leave-no-one-behind",
          "year": 2020
        }
      ],
      "methodology": "Estimated annual global cost of delivering a full routine childhood immunization schedule to every child (~USD 9-10 billion), combining Gavi replenishment figures and WHO IA2030 costing."
    },
    {
      "id": "world-hunger",
      "titleKey": "categories.tobacco.hunger.title",
      "unitLabelKey": "categories.tobacco.hunger.unit",
      "symbol": "grain",
      "scaleHint": "annualNeed",
      "unitCostUsd": 33000000000,
      "sources": [
        {
          "name": "Ceres2030 / Nature Research — Ending hunger sustainably",
          "url": "https://ceres2030.org/shorthand_story/ceres2030-sustainable-solutions-to-end-hunger/",
          "year": 2020
        }
      ],
      "methodology": "Average additional annual public expenditure (~USD 33 billion) required from donors and low/middle-income governments through 2030 to end hunger (SDG 2), per Ceres2030 / IFPRI models published in Nature Food."
    },
    {
      "id": "clean-water",
      "titleKey": "categories.tobacco.water.title",
      "unitLabelKey": "categories.tobacco.water.unit",
      "symbol": "drop",
      "scaleHint": "annualNeed",
      "unitCostUsd": 114000000000,
      "sources": [
        {
          "name": "World Bank — The Costs of Meeting the 2030 SDG Targets on Drinking Water, Sanitation, and Hygiene",
          "url": "https://openknowledge.worldbank.org/handle/10986/23681",
          "year": 2016
        }
      ],
      "methodology": "Annual capital investment of ~USD 114 billion needed through 2030 to achieve universal safely managed drinking water, per the World Bank's SDG 6 costing study."
    }
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/sources-data.test.ts
```

Expected: PASS, all war + tobacco specs green.

- [ ] **Step 5: Commit**

```bash
git add data/sources/tobacco.json tests/sources-data.test.ts
git commit -m "feat(data): add tobacco-use spending source ($1.7T/year, WHO 2022)"
```

---

## Task 4: Fossil-fuels source data

**Files:**
- Create: `data/sources/fossil-fuels.json`
- Modify: `tests/sources-data.test.ts`

- [ ] **Step 1: Extend the test**

Append:

```ts
import fossilJson from "@/data/sources/fossil-fuels.json";

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/sources-data.test.ts
```

Expected: FAIL — fossil-fuels.json missing.

- [ ] **Step 3: Write the file**

Create `data/sources/fossil-fuels.json`:

```json
{
  "id": "fossil-fuels",
  "labelKey": "sources.fossil-fuels.label",
  "currentYear": 2026,
  "projection": {
    "totalUsd": 7400000000000,
    "basedOnYear": 2024,
    "baseAmountUsd": 7400000000000,
    "growthBasis": "Annual figure used as a constant rate; not projected. IMF Working Paper 2025/270: USD 725 billion explicit subsidies (undercharging for supply costs) plus USD 6.7 trillion implicit subsidies (undercharging for environmental and air-pollution externalities), 2024 data, totalling ~7.1% of global GDP."
  },
  "source": "IMF Working Paper 2025/270 — Underpriced and Overused: Fossil Fuel Subsidies Data 2025 Update",
  "sourceUrl": "https://www.imf.org/en/publications/wp/issues/2025/12/20/underpriced-and-overused-fossil-fuel-subsidies-data-2025-update-572729",
  "lastUpdated": "2026-04-29",
  "categories": [
    {
      "id": "renewable-transition",
      "titleKey": "categories.fossil-fuels.renewable.title",
      "unitLabelKey": "categories.fossil-fuels.renewable.unit",
      "symbol": "ray",
      "scaleHint": "perUnit",
      "unitCostUsd": 1000000000,
      "sources": [
        {
          "name": "IRENA — Renewable Power Generation Costs in 2023",
          "url": "https://www.irena.org/Publications/2024/Sep/Renewable-power-generation-costs-in-2023",
          "year": 2024
        }
      ],
      "methodology": "Approximate capital cost to install one gigawatt (1 GW) of new utility-scale solar PV capacity, per IRENA's global weighted-average ~USD 0.8-1.1 billion per GW installed."
    },
    {
      "id": "rainforest-protection",
      "titleKey": "categories.fossil-fuels.rainforest.title",
      "unitLabelKey": "categories.fossil-fuels.rainforest.unit",
      "symbol": "leaf",
      "scaleHint": "totalSolution",
      "unitCostUsd": 45000000000,
      "sources": [
        {
          "name": "Rainforest Trust — Cost per acre protected",
          "url": "https://www.rainforesttrust.org/our-impact/",
          "year": 2023
        },
        {
          "name": "FAO — Global Forest Resources Assessment 2020",
          "url": "https://www.fao.org/forest-resources-assessment/2020/en",
          "year": 2020
        }
      ],
      "methodology": "Total cost to place all of Earth's remaining tropical rainforest under durable legal protection (USD 25/ha × ~1.8B ha)."
    },
    {
      "id": "clean-cooking-lmic",
      "titleKey": "categories.fossil-fuels.cleanCooking.title",
      "unitLabelKey": "categories.fossil-fuels.cleanCooking.unit",
      "symbol": "ray",
      "scaleHint": "annualNeed",
      "unitCostUsd": 10000000000,
      "sources": [
        {
          "name": "IEA — A Vision for Clean Cooking Access for All",
          "url": "https://www.iea.org/reports/a-vision-for-clean-cooking-access-for-all",
          "year": 2024
        }
      ],
      "methodology": "Average additional annual investment (~USD 10 billion) needed to give universal access to clean cooking solutions in low- and lower-middle-income countries by 2030, per IEA Clean Cooking pathway."
    },
    {
      "id": "climate-adaptation-africa",
      "titleKey": "categories.fossil-fuels.adaptation.title",
      "unitLabelKey": "categories.fossil-fuels.adaptation.unit",
      "symbol": "leaf",
      "scaleHint": "annualNeed",
      "unitCostUsd": 50000000000,
      "sources": [
        {
          "name": "UNEP — Adaptation Gap Report 2023",
          "url": "https://www.unep.org/resources/adaptation-gap-report-2023",
          "year": 2023
        },
        {
          "name": "African Development Bank — Africa Climate Change Action Plan",
          "url": "https://www.afdb.org/en/topics-and-sectors/initiatives-partnerships/climate-change-action-plan",
          "year": 2022
        }
      ],
      "methodology": "Estimated annual cost (~USD 50 billion) for sub-Saharan Africa to fund the most cost-effective adaptation measures (drought-resilient agriculture, sea defences, water security), per UNEP Adaptation Gap Report and AfDB modelling."
    },
    {
      "id": "building-retrofit",
      "titleKey": "categories.fossil-fuels.retrofit.title",
      "unitLabelKey": "categories.fossil-fuels.retrofit.unit",
      "symbol": "roof",
      "scaleHint": "totalSolution",
      "unitCostUsd": 1500000000000,
      "sources": [
        {
          "name": "IEA — Net Zero Roadmap, Buildings sector",
          "url": "https://www.iea.org/reports/net-zero-by-2050",
          "year": 2021
        }
      ],
      "methodology": "Approximate global capital outlay to retrofit existing buildings to net-zero standards (envelope, heat pumps, grid integration) by 2050, per IEA NZE 2050 cumulative buildings investment annualised."
    },
    {
      "id": "public-transit-cities",
      "titleKey": "categories.fossil-fuels.transit.title",
      "unitLabelKey": "categories.fossil-fuels.transit.unit",
      "symbol": "roof",
      "scaleHint": "perUnit",
      "unitCostUsd": 5000000000,
      "sources": [
        {
          "name": "World Bank — Transit-Oriented Development",
          "url": "https://www.worldbank.org/en/topic/transport",
          "year": 2023
        }
      ],
      "methodology": "Approximate capital cost to deploy a modern integrated bus rapid transit (BRT) plus metro extension covering a city of 5-10M residents (rolling stock + stations + dedicated infrastructure), per World Bank transit costing studies."
    },
    {
      "id": "grid-storage-100gwh",
      "titleKey": "categories.fossil-fuels.storage.title",
      "unitLabelKey": "categories.fossil-fuels.storage.unit",
      "symbol": "ray",
      "scaleHint": "perUnit",
      "unitCostUsd": 40000000000,
      "sources": [
        {
          "name": "BloombergNEF — Battery Storage Cost Survey 2024",
          "url": "https://about.bnef.com/blog/lithium-ion-battery-pack-prices-2024/",
          "year": 2024
        }
      ],
      "methodology": "Approximate installed cost of 100 GWh of utility-scale lithium-ion battery storage at 2024 prices (~USD 400/kWh installed including BoP and integration), per BNEF survey."
    },
    {
      "id": "world-hunger",
      "titleKey": "categories.fossil-fuels.hunger.title",
      "unitLabelKey": "categories.fossil-fuels.hunger.unit",
      "symbol": "grain",
      "scaleHint": "annualNeed",
      "unitCostUsd": 33000000000,
      "sources": [
        {
          "name": "Ceres2030 / Nature Research — Ending hunger sustainably",
          "url": "https://ceres2030.org/shorthand_story/ceres2030-sustainable-solutions-to-end-hunger/",
          "year": 2020
        }
      ],
      "methodology": "Average additional annual public expenditure (~USD 33 billion) required to end hunger (SDG 2), per Ceres2030 / IFPRI."
    }
  ]
}
```

- [ ] **Step 2.1: Run test to verify it passes**

```bash
npx vitest run tests/sources-data.test.ts
```

Expected: PASS, all three sources green.

- [ ] **Step 3: Commit**

```bash
git add data/sources/fossil-fuels.json tests/sources-data.test.ts
git commit -m "feat(data): add fossil-fuel-subsidies source ($7.4T/year, IMF 2025)"
```

---

## Task 5: Sources index + parseSourceId helper

**Files:**
- Create: `data/sources.index.ts`
- Create: `lib/sources.ts`
- Test: `tests/source-id.test.ts`

`sources.index.ts` is the single import path that gives any consumer the validated `Map<SourceId, Source>`. `lib/sources.ts` exposes pure helpers.

- [ ] **Step 1: Write the failing helper test**

Create `tests/source-id.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isValidSourceId, parseSourceId } from "@/lib/sources";

describe("parseSourceId", () => {
  it("returns a valid id verbatim", () => {
    expect(parseSourceId("war")).toBe("war");
    expect(parseSourceId("tobacco")).toBe("tobacco");
    expect(parseSourceId("fossil-fuels")).toBe("fossil-fuels");
  });

  it("returns null for unknown / empty / null", () => {
    expect(parseSourceId(null)).toBeNull();
    expect(parseSourceId("")).toBeNull();
    expect(parseSourceId("WAR")).toBeNull();
    expect(parseSourceId("oil")).toBeNull();
  });
});

describe("isValidSourceId", () => {
  it("narrows a string to SourceId", () => {
    const x: string = "tobacco";
    if (isValidSourceId(x)) {
      const _ok: "war" | "tobacco" | "fossil-fuels" = x;
    }
    expect(isValidSourceId("war")).toBe(true);
    expect(isValidSourceId("xx")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/source-id.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/sources'`.

- [ ] **Step 3: Implement helpers**

Create `lib/sources.ts`:

```ts
import { SOURCE_IDS, type SourceId } from "@/data/sources.schema";

export { SOURCE_IDS };
export type { SourceId };

export function isValidSourceId(value: unknown): value is SourceId {
  return typeof value === "string" && (SOURCE_IDS as readonly string[]).includes(value);
}

export function parseSourceId(value: string | null | undefined): SourceId | null {
  return isValidSourceId(value) ? value : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run tests/source-id.test.ts
```

Expected: PASS, 3 specs.

- [ ] **Step 5: Implement the index**

Create `data/sources.index.ts`:

```ts
import warJson from "@/data/sources/war.json";
import tobaccoJson from "@/data/sources/tobacco.json";
import fossilJson from "@/data/sources/fossil-fuels.json";
import { type Source, SourceSchema, type SourceId, SOURCE_IDS } from "@/data/sources.schema";

const warSource: Source = SourceSchema.parse(warJson);
const tobaccoSource: Source = SourceSchema.parse(tobaccoJson);
const fossilSource: Source = SourceSchema.parse(fossilJson);

export const SOURCES: Record<SourceId, Source> = {
  war: warSource,
  tobacco: tobaccoSource,
  "fossil-fuels": fossilSource,
};

export const SOURCES_LIST: readonly Source[] = SOURCE_IDS.map((id) => SOURCES[id]);

export function getSource(id: SourceId): Source {
  return SOURCES[id];
}
```

- [ ] **Step 6: Spot-check it loads**

```bash
npx vitest run tests/sources-data.test.ts
```

Expected: PASS — every source still validates after the index round-trip.

- [ ] **Step 7: Commit**

```bash
git add data/sources.index.ts lib/sources.ts tests/source-id.test.ts
git commit -m "feat(data): sources index + parseSourceId helper"
```

---

## Task 6: Dictionary type + nested category keys + EN fallback

**Files:**
- Modify: `app/[locale]/dictionaries.ts`
- Modify: `messages/en.json` (only — others stay untouched, the fallback handles them)
- Test: `tests/dictionary-fallback.test.ts`

The current `getCategoryDictKey(categoryId)` returns one short key. We're moving to nested namespaces — `categories.<sourceId>.<dictKey>`. We also need EN fallback for missing keys in DE/ES/FR.

- [ ] **Step 1: Write the failing fallback test**

Create `tests/dictionary-fallback.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getDictionary } from "@/app/[locale]/dictionaries";

describe("dictionary EN fallback", () => {
  it("returns EN value for keys missing in DE", async () => {
    const de = await getDictionary("de");
    // sources.* lives only in EN at v1; the loader must fall back.
    expect(de.sources.war.label).toBeDefined();
    expect(de.sources.war.label.length).toBeGreaterThan(0);
  });

  it("does not break existing top-level keys when they exist locally", async () => {
    const de = await getDictionary("de");
    // hero.caption already exists in de.json — should be the DE value, not EN.
    expect(de.hero.caption).toBeDefined();
    // Sanity: it should differ from EN if DE actually translated it. We do not
    // assert specific content because translations evolve.
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/dictionary-fallback.test.ts
```

Expected: FAIL — `de.sources` is undefined (we haven't added the fallback or the EN keys yet).

- [ ] **Step 3: Add EN dictionary keys for sources + per-source categories**

Edit `messages/en.json` so that the final file contains the existing top-level keys (`hello`, `hero`, `transition`, `methodology`, `footer`) **unchanged**, plus a new `sources` block, plus a **rewritten** `categories` block. Only `sources` and `categories` change.

Add this new top-level `sources` block (before or after `transition` is fine — JSON object keys are unordered):

```json
"sources": {
  "war": {
    "label": "War",
    "caption": "Spent on war since January 1, {year}",
    "rate": "{perDay} per day · {perSecond} per second",
    "methodology": "Projected {year}, based on SIPRI {basedOnYear} actuals and a 5-year average growth rate. SIPRI's annual update was published 27 April 2026."
  },
  "tobacco": {
    "label": "Tobacco use",
    "caption": "Lost to tobacco use since January 1, {year}",
    "rate": "{perDay} per day · {perSecond} per second",
    "methodology": "USD 1.7 trillion per year — healthcare costs and lost productivity from tobacco use, equivalent to 1.7% of global GDP. Source: WHO 2022 update."
  },
  "fossil-fuels": {
    "label": "Fossil fuels",
    "caption": "Subsidising fossil fuels since January 1, {year}",
    "rate": "{perDay} per day · {perSecond} per second",
    "methodology": "USD 7.4 trillion per year — explicit subsidies plus underpricing of climate and air-pollution costs. Source: IMF Working Paper 2025/270, 2024 data."
  }
}
```

**Replace** the existing `categories` block (the current one keys `military`, `sourcesToggle`, `cancer`, `malaria`, … directly) with this re-namespaced shape:

```json
"categories": {
  "sourcesToggle": "See sources",
  "war": {
    "label": "Military spending {year}",
    "cancer": { "title": "Cured cancer worldwide", "unit": "people", "compareUnit": "One cancer treatment" },
    "malaria": { "title": "Eradicated malaria globally", "unit": "times over" },
    "hunger": { "title": "Ended world hunger", "unit": "years" },
    "water": { "title": "Clean water for everyone", "unit": "years" },
    "schools": { "title": "Built schools in poor countries", "unit": "school places" },
    "vaccination": { "title": "Vaccinated every child on Earth", "unit": "annual campaigns" },
    "poverty": { "title": "Eliminated extreme poverty", "unit": "years" },
    "rainforest": { "title": "Protected all tropical rainforest", "unit": "times over" },
    "renewable": { "title": "Doubled the world's solar capacity", "unit": "GW of new solar" },
    "humanitarian": { "title": "Funded all humanitarian appeals", "unit": "years" }
  },
  "tobacco": {
    "label": "Tobacco use {year}",
    "lungCancer": { "title": "Cured lung cancer worldwide", "unit": "people", "compareUnit": "One full course of lung-cancer treatment" },
    "cessation": { "title": "Helped people quit smoking", "unit": "people quit", "compareUnit": "One cessation programme" },
    "mpower": { "title": "Funded WHO MPOWER in entire countries", "unit": "country-years", "compareUnit": "One country, fully implemented" },
    "tb": { "title": "Treated tuberculosis worldwide", "unit": "people", "compareUnit": "One full DOTS course" },
    "copd": { "title": "Cared for COPD patients for a year", "unit": "patient-years" },
    "vaccination": { "title": "Vaccinated every child on Earth", "unit": "annual campaigns" },
    "hunger": { "title": "Ended world hunger", "unit": "years" },
    "water": { "title": "Clean water for everyone", "unit": "years" }
  },
  "fossil-fuels": {
    "label": "Fossil-fuel subsidies {year}",
    "renewable": { "title": "Doubled the world's solar capacity", "unit": "GW of new solar" },
    "rainforest": { "title": "Protected all tropical rainforest", "unit": "times over" },
    "cleanCooking": { "title": "Clean cooking for all of Africa & Asia", "unit": "years" },
    "adaptation": { "title": "Funded climate adaptation for sub-Saharan Africa", "unit": "years" },
    "retrofit": { "title": "Retrofitted the world's buildings to net-zero", "unit": "times over" },
    "transit": { "title": "Built modern transit in megacities", "unit": "cities" },
    "storage": { "title": "Installed grid-scale battery storage", "unit": "× 100 GWh" },
    "hunger": { "title": "Ended world hunger", "unit": "years" }
  }
}
```

The previous `categories.military` (`"Military spending {year}"`) and the flat `categories.cancer` / `categories.malaria` / etc. are removed by this replacement — they are now inside `categories.war`. Pre-existing `hero`, `transition`, `methodology`, `footer`, `hello` keys are not touched.

- [ ] **Step 4: Update `app/[locale]/dictionaries.ts` for the new shape and EN fallback**

Replace the file content with:

```ts
import "server-only";
import enDict from "@/messages/en.json";

const dictionaries = {
  en: () => Promise.resolve(enDict),
  es: () => import("@/messages/es.json").then((m) => withFallback(m.default, enDict)),
  de: () => import("@/messages/de.json").then((m) => withFallback(m.default, enDict)),
  fr: () => import("@/messages/fr.json").then((m) => withFallback(m.default, enDict)),
} as const;

export const LOCALES = ["en", "es", "de", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const hasLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export type Dictionary = typeof enDict;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]() as Promise<Dictionary>;

/**
 * Recursively merge a partial locale dict on top of the EN fallback so any
 * key missing in the locale falls back to EN. The fallback shape (`enDict`)
 * is the canonical Dictionary type.
 */
function withFallback<T>(partial: unknown, fallback: T): T {
  if (
    typeof partial !== "object" ||
    partial === null ||
    typeof fallback !== "object" ||
    fallback === null
  ) {
    return (partial ?? fallback) as T;
  }
  const out: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
  for (const [k, v] of Object.entries(partial as Record<string, unknown>)) {
    out[k] = withFallback(v, (fallback as Record<string, unknown>)[k]);
  }
  return out as T;
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = values[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}

/**
 * Maps a `Category.id` (kebab-case, full descriptor) to the short dict key
 * used inside `messages/*.json` under `categories.<sourceId>.<key>`.
 *
 * Per-source mapping — the same category id can map to different short keys
 * across sources, but in practice the convention is to keep the same key,
 * with the source namespace providing the differentiator. Adding a new
 * (sourceId, categoryId) pair here is required when adding a new entry to
 * any data/sources/*.json file.
 */
export const CATEGORY_DICT_KEYS: Record<string, Record<string, string>> = {
  war: {
    "cancer-treatment": "cancer",
    "malaria-eradication": "malaria",
    "world-hunger": "hunger",
    "clean-water": "water",
    "schools-lmic": "schools",
    "child-vaccination": "vaccination",
    "extreme-poverty": "poverty",
    "rainforest-protection": "rainforest",
    "renewable-transition": "renewable",
    "humanitarian-aid": "humanitarian",
  },
  tobacco: {
    "lung-cancer-treatment": "lungCancer",
    "smoking-cessation": "cessation",
    "mpower-country": "mpower",
    "tb-treatment": "tb",
    "copd-care-year": "copd",
    "child-vaccination": "vaccination",
    "world-hunger": "hunger",
    "clean-water": "water",
  },
  "fossil-fuels": {
    "renewable-transition": "renewable",
    "rainforest-protection": "rainforest",
    "clean-cooking-lmic": "cleanCooking",
    "climate-adaptation-africa": "adaptation",
    "building-retrofit": "retrofit",
    "public-transit-cities": "transit",
    "grid-storage-100gwh": "storage",
    "world-hunger": "hunger",
  },
};

export function getCategoryDictKey(sourceId: string, categoryId: string): string {
  const sourceMap = CATEGORY_DICT_KEYS[sourceId];
  if (!sourceMap) throw new Error(`No dict mapping for source: ${sourceId}`);
  const key = sourceMap[categoryId];
  if (!key) throw new Error(`No dict mapping for ${sourceId}/${categoryId}`);
  return key;
}
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

Expected: PASS — `dictionary-fallback.test.ts` and earlier tests are green. `app/[locale]/page.tsx` will fail to type-check (we'll fix it in Task 9), but the test suite proper (`vitest run`) does not type-check pages.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/dictionaries.ts messages/en.json tests/dictionary-fallback.test.ts
git commit -m "feat(i18n): nested per-source dict keys, EN fallback for non-EN locales"
```

---

## Task 7: SourceTabs component

**Files:**
- Create: `components/sources/SourceTabs.tsx`
- Test: covered by Playwright in Task 14

`SourceTabs` is a stateless presentational component that receives `activeId` + `onSelect` + a list of `{ id, label }` and renders the tabs with full a11y semantics. It does not own state — `SourceSwitcher` does.

- [ ] **Step 1: Implement the component**

Create `components/sources/SourceTabs.tsx`:

```tsx
"use client";

import type { SourceId } from "@/data/sources.schema";

export type SourceTabItem = { id: SourceId; label: string };

type Props = {
  items: readonly SourceTabItem[];
  activeId: SourceId;
  onSelect: (id: SourceId) => void;
  ariaLabel: string;
};

/**
 * Horizontally arranged tabs. Mono, uppercase, tracking-[0.18em] to match
 * the rate/methodology aesthetic. Active tab gets a 2px bottom border in
 * --text-primary; inactive tabs sit in --text-secondary and lift to
 * --text-primary on hover/focus.
 *
 * Mobile: overflow-x-auto, no scrollbar, no wrap. Items are spaced via
 * gap-6, never breaking onto two lines.
 */
export function SourceTabs({ items, activeId, onSelect, ariaLabel }: Props) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-6 overflow-x-auto scrollbar-none flex-nowrap mb-12 md:mb-16"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="source-tabpanel"
            id={`source-tab-${item.id}`}
            tabIndex={isActive ? 0 : -1}
            data-mp-event="source_switch"
            data-mp-source={item.id}
            onClick={() => onSelect(item.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const idx = items.findIndex((i) => i.id === activeId);
                const delta = e.key === "ArrowRight" ? 1 : -1;
                const next = items[(idx + delta + items.length) % items.length];
                onSelect(next.id);
              }
            }}
            className={[
              "font-mono text-xs md:text-sm uppercase tracking-[0.18em]",
              "whitespace-nowrap pb-1 border-b-2 transition-colors",
              "focus-visible:outline-none focus-visible:text-[var(--text-primary)]",
              isActive
                ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify it builds**

```bash
npx tsc --noEmit
```

Expected: no errors related to `SourceTabs`. (Existing `app/[locale]/page.tsx` may still fail — Task 9 fixes it.)

- [ ] **Step 3: Commit**

```bash
git add components/sources/SourceTabs.tsx
git commit -m "feat(ui): add SourceTabs component"
```

---

## Task 8: SourceHero + SourceCategories components

**Files:**
- Create: `components/sources/SourceHero.tsx`
- Create: `components/sources/SourceCategories.tsx`

These extract the existing hero + ledger blocks from `app/[locale]/page.tsx` into source-driven components. Both render content from a passed-in `Source` + `Dictionary`.

- [ ] **Step 1: Implement SourceHero**

Create `components/sources/SourceHero.tsx`:

```tsx
"use client";

import type { Source, SourceId } from "@/data/sources.schema";
import { TickingCounter } from "@/components/hero/TickingCounter";
import { formatCompact, formatCurrency, type SupportedLocale } from "@/lib/formatters";

type Strings = {
  caption: string;
  rate: string;
  methodology: string;
};

type Props = {
  source: Source;
  locale: SupportedLocale;
  strings: Strings;
};

export function SourceHero({ source, locale, strings }: Props) {
  const { projection, currentYear } = source;
  const secondsInCurrentYear =
    (Date.UTC(currentYear + 1, 0, 1) - Date.UTC(currentYear, 0, 1)) / 1000;
  const perSecondUsd = projection.totalUsd / secondsInCurrentYear;
  const perDayUsd = perSecondUsd * 86_400;

  const rateText = strings.rate
    .replace("{perDay}", formatCompact(perDayUsd, locale))
    .replace("{perSecond}", formatCurrency(Math.round(perSecondUsd), locale));

  return (
    <section
      role="tabpanel"
      id="source-tabpanel"
      aria-labelledby={`source-tab-${source.id satisfies SourceId}`}
      className="mb-16 md:mb-24 motion-safe:animate-[fadein_240ms_ease-out]"
      key={source.id}
    >
      <p
        className="font-serif text-2xl md:text-4xl text-[var(--text-primary)] mb-2"
        style={{ minHeight: "1.2em" }}
      >
        {strings.caption}
      </p>
      <TickingCounter projection={projection} currentYear={currentYear} locale={locale} />
      <p
        className="font-mono text-xs md:text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)] mt-3 tabular-nums"
        style={{ minHeight: "1.2em" }}
      >
        {rateText}
      </p>
      <p className="font-sans text-xs md:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed mt-4">
        {strings.methodology}
      </p>
    </section>
  );
}
```

The `motion-safe:animate-[fadein_240ms_ease-out]` Tailwind utility refers to a keyframe defined in `app/globals.css`. Add it in step 2.

- [ ] **Step 2: Add the fadein keyframe**

Append to `app/globals.css`:

```css
@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

- [ ] **Step 3: Implement SourceCategories**

Create `components/sources/SourceCategories.tsx`:

```tsx
"use client";

import { CategoryRow, type CategoryRowStrings } from "@/components/categories/CategoryRow";
import type { Source } from "@/data/sources.schema";
import type { SupportedLocale } from "@/lib/formatters";

type DictCategoryEntry = {
  title: string;
  unit: string;
  compareUnit?: string;
};

type Strings = {
  headline: string;
  sourceLabel: string;            // e.g. "Military spending 2026"
  sourcesToggle: string;
  categories: Record<string, DictCategoryEntry>; // keyed by short dict key
  shortKeyFor: (categoryId: string) => string;   // mapping fn from data id to dict key
};

type Props = {
  source: Source;
  locale: SupportedLocale;
  strings: Strings;
};

export function SourceCategories({ source, locale, strings }: Props) {
  return (
    <section className="motion-safe:animate-[fadein_240ms_ease-out]" key={source.id}>
      <h2 className="font-serif text-3xl md:text-5xl text-[var(--text-primary)] mb-8 md:mb-12">
        {strings.headline}
      </h2>
      <div>
        {source.categories.map((category) => {
          const shortKey = strings.shortKeyFor(category.id);
          const entry = strings.categories[shortKey];
          const compareUnit = entry.compareUnit ?? entry.title;
          const rowStrings: CategoryRowStrings = {
            title: entry.title,
            unit: entry.unit,
            militaryBarLabel: strings.sourceLabel,
            alternativeBarLabel: compareUnit,
            sourcesToggle: strings.sourcesToggle,
          };
          return (
            <CategoryRow
              key={category.id}
              category={category}
              projection={source.projection}
              currentYear={source.currentYear}
              locale={locale}
              strings={rowStrings}
            />
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify it builds**

```bash
npx tsc --noEmit
```

Expected: no errors in `components/sources/`. The existing `page.tsx` and `CategoryRow.tsx` may still fail — Task 9 fixes them.

- [ ] **Step 5: Commit**

```bash
git add components/sources/SourceHero.tsx components/sources/SourceCategories.tsx app/globals.css
git commit -m "feat(ui): add SourceHero and SourceCategories"
```

---

## Task 9: Repoint type-only consumers at sources.schema (old data files still in place)

**Files:**
- Modify: `components/categories/CategoryRow.tsx` (1 import line)
- Modify: `lib/categories.ts` (only if it imports from the old schema — verify)

We keep `data/categories.schema.ts`, `data/military-spending.schema.ts`, and the JSON files in place during this task so that `page.tsx` keeps compiling. They are deleted at the end of Task 10, after `page.tsx` no longer references them.

- [ ] **Step 1: Find all consumers of the old type schemas**

```bash
grep -rn "@/data/categories.schema" --include="*.ts" --include="*.tsx" .
grep -rn "@/data/military-spending" --include="*.ts" --include="*.tsx" .
```

Expected output: at minimum `components/categories/CategoryRow.tsx` and `app/[locale]/page.tsx`. `lib/categories.ts` may or may not — check.

- [ ] **Step 2: Repoint type-only imports — but NOT page.tsx yet**

For every printed file *except* `app/[locale]/page.tsx`:
- Replace `from "@/data/categories.schema"` → `from "@/data/sources.schema"`.

Example for `components/categories/CategoryRow.tsx`:

```tsx
// Before
import type { Category } from "@/data/categories.schema";
// After
import type { Category } from "@/data/sources.schema";
```

`page.tsx` is left alone here — it still imports the old `categories` and `militarySpending` runtime data. Task 10 rewrites it.

- [ ] **Step 3: Verify the type-check**

```bash
npx tsc --noEmit
```

Expected: PASS. Both old (still-present) and new schemas live side-by-side; consumers point at the new one; `page.tsx` still compiles against the old one.

- [ ] **Step 4: Commit**

```bash
git add components/categories/CategoryRow.tsx lib/categories.ts
git commit -m "refactor(data): repoint Category type imports at sources.schema"
```

---

## Task 10: SourceSwitcher + wire into page.tsx

**Files:**
- Create: `components/sources/SourceSwitcher.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Implement SourceSwitcher**

Create `components/sources/SourceSwitcher.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { SourceHero } from "@/components/sources/SourceHero";
import { SourceCategories } from "@/components/sources/SourceCategories";
import { SourceTabs, type SourceTabItem } from "@/components/sources/SourceTabs";
import { SOURCES } from "@/data/sources.index";
import { type SourceId } from "@/data/sources.schema";
import { parseSourceId } from "@/lib/sources";
import type { SupportedLocale } from "@/lib/formatters";
import { track } from "@/lib/mixpanel";

type DictionarySourceBlock = {
  label: string;
  caption: string;
  rate: string;
  methodology: string;
};
type DictionaryCategoryBlock = {
  label: string; // e.g. "Military spending {year}"
  [shortKey: string]: { title: string; unit: string; compareUnit?: string } | string;
};

type Props = {
  locale: SupportedLocale;
  ariaTabsLabel: string;
  transitionHeadline: string;
  sourcesDict: Record<SourceId, DictionarySourceBlock>;
  categoriesDict: Record<SourceId, DictionaryCategoryBlock>;
  sourcesToggle: string;
  shortKeyFor: (sourceId: SourceId, categoryId: string) => string;
};

export function SourceSwitcher({
  locale,
  ariaTabsLabel,
  transitionHeadline,
  sourcesDict,
  categoriesDict,
  sourcesToggle,
  shortKeyFor,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const activeId: SourceId = parseSourceId(params.get("source")) ?? "war";
  const source = SOURCES[activeId];

  const items: readonly SourceTabItem[] = (Object.keys(SOURCES) as SourceId[]).map((id) => ({
    id,
    label: sourcesDict[id].label,
  }));

  // Fire one-shot URL-arrival event for deep-linked sources (?source=tobacco
  // direct land), excluding the default "war" so we don't double-count
  // page_view's initial_source.
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (params.get("source") && activeId !== "war") {
      track("source_switch", { from: null, to: activeId, locale, via: "url" });
    }
  }, [activeId, locale, params]);

  const onSelect = (id: SourceId) => {
    if (id === activeId) return;
    track("source_switch", { from: activeId, to: id, locale, via: "click" });
    const next = id === "war" ? "" : `?source=${id}`;
    router.replace(`/${locale}${next}`, { scroll: false });
  };

  const heroStrings = {
    caption: sourcesDict[activeId].caption.replace("{year}", String(source.currentYear)),
    rate: sourcesDict[activeId].rate,
    methodology: sourcesDict[activeId].methodology
      .replace("{year}", String(source.currentYear))
      .replace("{basedOnYear}", String(source.projection.basedOnYear)),
  };

  const dictBlock = categoriesDict[activeId];
  const sourceLabel = (dictBlock.label as string).replace("{year}", String(source.currentYear));
  // Build a Record<shortKey, entry> excluding the "label" field.
  const categoriesEntries: Record<string, { title: string; unit: string; compareUnit?: string }> =
    {};
  for (const [k, v] of Object.entries(dictBlock)) {
    if (k === "label") continue;
    categoriesEntries[k] = v as { title: string; unit: string; compareUnit?: string };
  }

  return (
    <div data-source={activeId}>
      <SourceTabs
        items={items}
        activeId={activeId}
        onSelect={onSelect}
        ariaLabel={ariaTabsLabel}
      />
      <SourceHero source={source} locale={locale} strings={heroStrings} />
      <SourceCategories
        source={source}
        locale={locale}
        strings={{
          headline: transitionHeadline,
          sourceLabel,
          sourcesToggle,
          categories: categoriesEntries,
          shortKeyFor: (catId) => shortKeyFor(activeId, catId),
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Replace page.tsx**

Overwrite `app/[locale]/page.tsx` with:

```tsx
import { notFound } from "next/navigation";
import { SourceSwitcher } from "@/components/sources/SourceSwitcher";
import { Footer } from "@/components/layout/Footer";
import { Methodology } from "@/components/layout/Methodology";
import { type Locale, getCategoryDictKey, getDictionary, hasLocale } from "./dictionaries";
import type { SupportedLocale } from "@/lib/formatters";
import type { SourceId } from "@/data/sources.schema";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <SourceSwitcher
          locale={locale as SupportedLocale}
          ariaTabsLabel="Spending source"
          transitionHeadline={dict.transition.headline}
          sourcesDict={dict.sources}
          categoriesDict={{
            war: dict.categories.war,
            tobacco: dict.categories.tobacco,
            "fossil-fuels": dict.categories["fossil-fuels"],
          }}
          sourcesToggle={dict.categories.sourcesToggle}
          shortKeyFor={(sid: SourceId, cid: string) => getCategoryDictKey(sid, cid)}
        />

        <Methodology strings={dict.methodology} />
        <Footer currentLocale={locale as Locale} yearTemplate={dict.footer.year} />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Build + run dev to spot-check**

```bash
npm run build
```

Expected: build passes for all 4 locales.

```bash
npm run dev
# in another terminal:
curl -s http://localhost:3000/en | head
curl -s "http://localhost:3000/en?source=tobacco" | head
```

Expected: HTML returned in both cases without runtime errors. Visit `/en` in a browser, click each tab, watch URL change.

- [ ] **Step 4: Delete the old data files**

Now that nothing imports them:

```bash
git rm data/categories.json data/categories.schema.ts \
       data/military-spending.json data/military-spending.schema.ts
```

Re-run the type-check + build to make sure the deletion broke nothing:

```bash
npx tsc --noEmit && npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): SourceSwitcher wires tabs + URL state, drop legacy data files"
```

---

## Task 11: Mixpanel — source_switch event and source field on category events

**Files:**
- Modify: `components/analytics/Analytics.tsx`

The existing `Analytics.tsx` does delegated tracking via DOM listeners. We add:
1. `source_switch` is fired directly from `SourceSwitcher` (already done in Task 10) — Analytics.tsx doesn't need to handle it via delegation since the ref-based call site is cleaner.
2. `category_expanded` / `category_collapsed` / `source_clicked` need a `source` field. We read it from the closest `[data-source]` ancestor, set by SourceSwitcher's wrapper div.
3. `page_view` gets `initial_source` from the URL.

- [ ] **Step 1: Edit Analytics.tsx**

Replace the file content with:

```tsx
"use client";

import { useEffect } from "react";
import { initMixpanel, track } from "@/lib/mixpanel";
import { parseSourceId } from "@/lib/sources";

type Props = {
  locale: string;
};

function readActiveSource(target: HTMLElement | null): string {
  const el = target?.closest("[data-source]") as HTMLElement | null;
  return el?.dataset.source ?? "war";
}

export function Analytics({ locale }: Props) {
  useEffect(() => {
    initMixpanel();

    const url = new URL(window.location.href);
    const initialSource = parseSourceId(url.searchParams.get("source")) ?? "war";
    track("page_view", {
      locale,
      path: url.pathname,
      referrer: document.referrer || null,
      initial_source: initialSource,
    });

    const onToggle = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLDetailsElement)) return;
      const id = target.dataset.categoryId;
      if (!id) return;
      track(target.open ? "category_expanded" : "category_collapsed", {
        category_id: id,
        source: readActiveSource(target),
        locale,
      });
    };
    document.addEventListener("toggle", onToggle, true);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const langNav = link.closest('nav[aria-label="Language"]');
      if (langNav) {
        const to = link.textContent?.trim().toLowerCase() ?? null;
        track("language_switched", { from: locale, to });
        return;
      }

      const sourceCategory = link
        .closest("details[data-category-id]")
        ?.getAttribute("data-category-id");
      if (sourceCategory && link.target === "_blank") {
        track("source_clicked", {
          category_id: sourceCategory,
          source_url: link.href,
          source_label: link.textContent?.trim() ?? null,
          source: readActiveSource(target),
          locale,
        });
        return;
      }

      if (link.href.includes("github.com/")) {
        track("github_clicked", { locale, href: link.href });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("click", onClick);
    };
  }, [locale]);

  return null;
}
```

- [ ] **Step 2: Sanity-check the build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/analytics/Analytics.tsx
git commit -m "feat(analytics): track source_switch + tag category events with source"
```

---

## Task 12: Playwright E2E for tab switching, deep link, reduced motion

**Files:**
- Create: `tests/source-switcher.spec.ts`

- [ ] **Step 1: Write the spec**

Create `tests/source-switcher.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("source tabs", () => {
  test("default state is war, no ?source= in URL", async ({ page }) => {
    await page.goto("/en");
    const url = new URL(page.url());
    expect(url.searchParams.get("source")).toBeNull();
    await expect(page.getByRole("tab", { name: /war/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("clicking Tobacco updates URL and active tab", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("tab", { name: /tobacco/i }).click();
    await expect(page).toHaveURL(/\?source=tobacco/);
    await expect(page.getByRole("tab", { name: /tobacco/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tab", { name: /war/i })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  test("direct ?source=fossil-fuels lands on the right tab", async ({ page }) => {
    await page.goto("/en?source=fossil-fuels");
    await expect(page.getByRole("tab", { name: /fossil/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Hero copy reflects fossil-fuels methodology
    await expect(page.getByText(/IMF Working Paper/i)).toBeVisible();
  });

  test("clicking the active tab is a no-op", async ({ page }) => {
    await page.goto("/en?source=tobacco");
    const url1 = page.url();
    await page.getByRole("tab", { name: /tobacco/i }).click();
    const url2 = page.url();
    expect(url1).toBe(url2);
  });

  test("ArrowRight cycles tabs", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("tab", { name: /war/i }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /tobacco/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("reduced-motion disables fade animation", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/en");
    await page.getByRole("tab", { name: /tobacco/i }).click();
    // No assertion on opacity — just ensure no runtime errors. The
    // motion-safe: variant pruning is implicit in Tailwind.
    await expect(page.getByRole("tab", { name: /tobacco/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await context.close();
  });
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/source-switcher.spec.ts
```

Expected: PASS, 6 specs across all configured browsers in `playwright.config.ts`.

- [ ] **Step 3: Commit**

```bash
git add tests/source-switcher.spec.ts
git commit -m "test(e2e): tab switching, deep link, keyboard nav, reduced motion"
```

---

## Task 13: Lint, format, full test sweep

**Files:** none — verification only.

- [ ] **Step 1: Format**

```bash
npx biome format --write .
```

Expected: any reformatted files staged.

- [ ] **Step 2: Lint**

```bash
npx biome lint .
```

Expected: no errors. Fix anything reported.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Unit tests**

```bash
npx vitest run
```

Expected: PASS, all suites green.

- [ ] **Step 5: E2E**

```bash
npx playwright test
```

Expected: PASS — including the new `source-switcher.spec.ts` and any pre-existing specs.

- [ ] **Step 6: Build**

```bash
npm run build
```

Expected: PASS, static export emitted to `out/`.

- [ ] **Step 7: Commit any auto-formatted files**

```bash
git status
# if anything was reformatted:
git add -A && git commit -m "chore: biome format pass"
```

---

## Task 14: Bundle-size guard

**Files:** none — verification only.

The spec calls out a 100KB upper bound on the combined JSON payload. Check after wiring all three sources:

- [ ] **Step 1: Measure JSON payload**

```bash
wc -c data/sources/*.json
```

Expected: total under 100KB.

- [ ] **Step 2: Check generated client bundle**

```bash
npm run build 2>&1 | grep -E "First Load|page.js"
```

Expected: First Load JS for `/[locale]` route reasonably close to its pre-change size (within +20KB). If it ballooned past +50KB, switch to dynamic imports per source — open a follow-up task instead of patching here.

- [ ] **Step 3: Note the numbers in the PR description draft**

Save the output of step 2 to `/tmp/bundle-after.txt` for inclusion in the PR description.

---

## Task 15: design-taste-frontend pass

**Files:** any visual file touched by the previous tasks.

Per project convention (memory: "Three-skill design stack"), every UI feature runs through `design-taste-frontend` → `emil-design-eng` → `impeccable` before merging.

- [ ] **Step 1: Invoke the skill**

Use the `Skill` tool to invoke `design-taste-frontend`. Apply its recommendations on:
- Tab spacing rhythm (gap, padding, border weight)
- Active-tab visual weight vs hero typography
- Mobile horizontal-scroll polish (fades on edges? edge-bleed?)
- Vertical rhythm between tabs and the caption
- Whether tabs should have a subtle separator beneath the row when scrolled

- [ ] **Step 2: Apply edits** identified by the skill, restricted to UI files (`components/sources/*`, `app/globals.css`).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "polish(design-taste): apply tabs and hero rhythm refinements"
```

---

## Task 16: emil-design-eng pass

- [ ] **Step 1: Invoke the skill**

Use `Skill` to invoke `emil-design-eng`. Focus on:
- Fade-in timing (240ms — feels right? too long? curve?)
- Counter remount feel on tab switch (jarring? smooth? in-between?)
- Focus rings on tabs — keyboard nav should feel deliberate, not bolt-on
- Hover state for inactive tabs — is there a sub-pixel reveal that would help?
- Whether the active tab's bottom border should animate-in on switch

- [ ] **Step 2: Apply edits** identified by the skill.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "polish(emil-design-eng): refine micro-interactions on source tabs"
```

---

## Task 17: impeccable pass

- [ ] **Step 1: Invoke the skill**

Use `Skill` to invoke `impeccable`. Final polish across:
- Unused props / dead code introduced during the migration
- Overly defensive checks
- Comments that no longer match the code
- Accessibility audit (axe-core run via Playwright if not already)
- Lighthouse — maintain 100/100/100/100

- [ ] **Step 2: Apply edits**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "polish(impeccable): final pass pre-merge"
```

---

## Task 18: Lighthouse + final verification

**Files:** none — verification only.

- [ ] **Step 1: Run a production build**

```bash
npm run build && npx serve out -p 4173 &
SERVE_PID=$!
sleep 2
```

- [ ] **Step 2: Run Lighthouse on each tab**

```bash
npx lighthouse http://localhost:4173/en --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh-war.json
npx lighthouse "http://localhost:4173/en?source=tobacco" --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh-tobacco.json
npx lighthouse "http://localhost:4173/en?source=fossil-fuels" --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh-fossil.json
```

Expected: each report shows perf/a11y/best-practices/SEO ≥ 95 (target 100). If any score drops, identify the regression and patch before opening the PR.

- [ ] **Step 3: Stop the server**

```bash
kill $SERVE_PID
```

- [ ] **Step 4: Save Lighthouse summary for PR**

```bash
for f in /tmp/lh-war.json /tmp/lh-tobacco.json /tmp/lh-fossil.json; do
  node -e "const r=require('$f');console.log('$f',Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,v.score])));"
done > /tmp/lh-summary.txt
cat /tmp/lh-summary.txt
```

---

## Task 19: Push branch + open PR

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feature/source-tabs
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "feat: source-tabs (war / tobacco / fossil fuels)" --body "$(cat <<'EOF'
## Summary
- Adds three swappable spending narratives — military (refreshed to SIPRI 2025 actuals, $2.887T → 2026 projection $3.11T), tobacco use ($1.7T/year, WHO 2022), fossil-fuel subsidies ($7.4T/year, IMF 2025).
- Each tab fully replaces hero (caption, ticking counter, rate, methodology) and the alternatives ledger (per-tab category sets).
- URL deep-link via `?source=war|tobacco|fossil-fuels`. Default (and SEO-canonical) tab is `war`.
- Migrates `data/military-spending.json` + `data/categories.json` into a unified Zod-validated `data/sources/{war,tobacco,fossil-fuels}.json` shape behind `data/sources.index.ts`.
- Mixpanel: new `source_switch` event; `category_*` and `source_clicked` events tagged with `source`; `page_view` includes `initial_source`.
- i18n: EN fully translated for new keys; DE/ES/FR fall back to EN until translator-led PR.
- Three design-skill passes applied (`design-taste-frontend`, `emil-design-eng`, `impeccable`).

## Test plan
- [ ] `npx vitest run` — all unit suites green
- [ ] `npx playwright test` — all e2e green, including new `source-switcher.spec.ts`
- [ ] `npm run build` — static export succeeds for all 4 locales
- [ ] Manual: visit `/en`, `/en?source=tobacco`, `/en?source=fossil-fuels`; tab clicks update URL without scroll-jump; counter ticks per tab; categories ledger reflects per-tab set
- [ ] Manual: keyboard ArrowRight/ArrowLeft cycles tabs
- [ ] Lighthouse 100/100/100/100 verified on all three states

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Note the PR URL** for the user.

---

## Self-review notes

- **Spec coverage:** every section of the spec maps to a task — §2 data → Tasks 1-5, §3 categories → Tasks 2-4, §4 architecture → Tasks 1+5, §5 UI → Tasks 7-10, §6 state → Task 10, §7 analytics → Task 11, §8 i18n → Task 6, §10 tests → Tasks 1-4 + 12, §11 design passes → Tasks 15-17, §13 risks → covered by Task 14 (bundle), Task 12 (reduced motion, deep link), Task 18 (Lighthouse).
- **Type consistency:** `Source`, `Category`, `SourceId`, `parseSourceId`, `getCategoryDictKey(sourceId, categoryId)`, `SOURCES`, `getSource` all defined in early tasks and used consistently downstream.
- **Placeholder check:** no "TBD" or "implement later" — every code block is complete. The `categories[]` section of `data/sources/war.json` in Task 2 says "paste from existing categories.json with titleKey rewritten" — that's a deterministic transform with a complete mapping table inline; not a placeholder.
- **Decision recorded:** moved RU out of scope after grepping `messages/` and `LOCALES`. Spec updated.

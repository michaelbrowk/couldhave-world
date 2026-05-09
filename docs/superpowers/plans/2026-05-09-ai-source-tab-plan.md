# AI Source Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth source tab (`ai`) to the war-cost-landing page, surfacing global AI infrastructure capex (~$500B for 2026) with eight comparison categories — half historical bubble parallels (dotcom telecom buildout, Apollo, Manhattan Project, current AI revenue), half humanitarian/productive foil — so the page poses the implicit "is it a bubble?" question without answering it editorially.

**Architecture:** Pure data addition. The existing `SourceSwitcher` / `SourceTabs` / `SourceHero` / `SourceCategories` component graph is data-driven and auto-derives the tab list from `Object.keys(SOURCES)`. Touch points: schema enum, new JSON data file, source registry, dictionary entries, category-id-to-dict-key mapping, e2e test extension. Zero changes to the rendering components.

**Tech Stack:** Next.js 15 (`output: 'export'`), Zod 4 schema validation, Tailwind v4, React 19, Vitest (unit), Playwright (e2e), Biome (lint/format), pm2 + nginx + rsync deploy.

---

## Spec Reference

`docs/superpowers/specs/2026-05-09-ai-source-tab-design.md` (commit `5dcf5f9`).

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `data/sources.schema.ts` | Modify (1 line) | Add `"ai"` to `SOURCE_IDS` tuple |
| `data/sources/ai.json` | Create | New source data: projection, historical, 8 categories |
| `data/sources.index.ts` | Modify | Import + register `aiSource` in `SOURCES` record |
| `messages/en.json` | Modify | Add `sources.ai.*` and `categories.ai.*` blocks |
| `app/[locale]/dictionaries.ts` | Modify | Add `ai:` entry to `CATEGORY_DICT_KEYS` |
| `tests/unit/sources-schema.test.ts` | Modify | Extend coverage to `ai.json` |
| `tests/unit/dictionary-fallback.test.ts` | Modify | Extend coverage to `categories.ai.*` |
| `tests/e2e/source-switcher.spec.ts` | Modify | Add deep-link + click spec for AI tab |

No new components. No CSS changes. No analytics changes (`Analytics.tsx` reads `data-mp-source` attributes which are data-driven).

## Cursed-duplicates safeguard

The repo has been hit twice by Finder/iCloud-resurrected `* 2.*` files (commits `819a35e`, `3040d7d`). Throughout this plan, **never use `git add -A` or `git add .`**. Always stage specific files. Run `git status` before each commit and verify the staging area contains only intended paths.

---

## Task 1: Create feature branch

**Files:** none (git only).

- [ ] **Step 1: Verify clean working tree**

Run:
```bash
git status
```
Expected: working tree clean, branch `main` ahead of origin by 1 commit (the spec).

If untracked `* 2.*` files appear, do not add them — they will be ignored throughout.

- [ ] **Step 2: Create and switch to feature branch**

Run:
```bash
git checkout -b feature/ai-source-tab
```
Expected: `Switched to a new branch 'feature/ai-source-tab'`.

---

## Task 2: Research and finalize AI capex numbers

**Goal:** Replace spec placeholders ($500B / $320B / 5-year geomean) with current published figures. Update to actuals only if a more authoritative number is found; otherwise the spec defaults stand.

**Files:** Working notes only (no commit). Output is the data set used in Task 3.

- [ ] **Step 1: WebSearch hyperscaler FY26 capex guidance**

Run WebSearch with queries:
- `"Microsoft FY26 capex guidance" 2026 AI`
- `"Alphabet 2026 capex" AI infrastructure`
- `"Meta 2026 capex" AI`
- `"Amazon 2026 capex" AI infrastructure`

Capture per-company FY26 capex guidance (USD billions, AI-attributable share). Big-4 sum ≈ $390-420B expected.

- [ ] **Step 2: WebSearch composite projections**

Run WebSearch:
- `Bloomberg Intelligence AI infrastructure capex 2026 projection`
- `Morgan Stanley AI capex tracker 2026`
- `Goldman Sachs AI investment 2026 trillion`

Pick **one** canonical projection for `sourceUrl`. Preference order:
1. Bloomberg Intelligence (most cited)
2. Morgan Stanley AI Capex Tracker
3. Goldman Sachs Global Investment Research

- [ ] **Step 3: WebSearch historical data points**

Run WebSearch:
- `global AI capex 2020 2021 2022 hyperscaler historical`
- `IDC Worldwide AI Spending Guide historical`

Capture annual totals 2020-2025 (each `actual: true`). Spec defaults: $30B → $50B → $70B → $120B → $220B → $320B (revisit; numbers may shift after Q4-2025 earnings already reported).

- [ ] **Step 4: Compute growthFactor**

Geometric mean of YoY growth from 2020-2025 (5 compounding years):
```
growthFactor = (year2025 / year2020)^(1/5)
```
Example: `(320/30)^(1/5) ≈ 1.605`. Then `totalUsd = year2025 × growthFactor` rounded to a clean number.

Compute and write down:
- `totalUsd` (USD)
- `baseAmountUsd` (USD)
- `growthFactor` (decimal)
- 6 historical entries `{ year, totalUsd, actual: true }`

- [ ] **Step 5: WebSearch dotcom telecom capex citation**

Run WebSearch:
- `dotcom telecom infrastructure capital expenditure 1996 2001 total`
- `"Federal Reserve" telecom bust capital spending`
- `McKinsey dotcom telecom investment retrospective`

Find one live URL citing ≈ $500B (1996-2001, inflation-adjusted to current USD). Acceptable sources: Federal Reserve research papers, McKinsey Quarterly, NBER working papers. Avoid blog posts and Wikipedia.

- [ ] **Step 6: WebSearch global AI revenue 2025**

Run WebSearch:
- `global AI revenue 2025 IDC Bloomberg`
- `generative AI market revenue 2025`

Capture total 2025 AI software + services revenue. Range $30-50B expected.

- [ ] **Step 7: Verify Apollo / Manhattan Project numbers**

Run WebSearch:
- `Apollo program total cost 2024 dollars Planetary Society`
- `Manhattan Project total cost 2024 dollars inflation`

Apollo: $280B in 2024 USD (Planetary Society canonical citation: `https://www.planetary.org/space-policy/cost-of-apollo`).
Manhattan: $30B in 2024 USD (Atomic Heritage Foundation).

If WebSearch returns updated figures, use those. Verify all URLs return HTTP 200 (`curl -s -o /dev/null -w "%{http_code}\n" <url>`).

- [ ] **Step 8: Verify US grid modernization**

Run WebSearch:
- `Princeton REPEAT US grid modernization cost 2050`
- `DOE Grid Deployment Office investment`
- `Brattle Group power grid investment outlook`

Capture per-year average: ~$167B/year over 30 years. Cite Princeton REPEAT or DOE GDO; verify URL.

- [ ] **Step 9: Save working note**

Write findings to a temporary file or chat note (do not commit). Format:

```
totalUsd: <USD>
basedOnYear: 2025
baseAmountUsd: <USD>
growthFactor: <decimal>
growthBasis: "<text>"
historical: [
  { year: 2025, totalUsd: <USD>, actual: true },
  ...
]
sourceUrl: <URL>
source: "<name>"

Categories:
  dotcom-telecom-capex: unitCostUsd=<USD>, source URL=<URL>, name=<name>, year=<int>
  global-ai-revenue-2025: ...
  apollo-program: ...
  ... (8 total)
```

These values feed Task 3 directly.

---

## Task 3: Author `data/sources/ai.json` + register in schema and index

**Files:**
- Modify: `data/sources.schema.ts:3`
- Create: `data/sources/ai.json`
- Modify: `data/sources.index.ts`
- Test: `tests/unit/sources-schema.test.ts`

- [ ] **Step 1: Read existing schema test to understand structure**

Run:
```bash
cat tests/unit/sources-schema.test.ts
```
Expected: see how it asserts `SOURCE_IDS` membership and parses each JSON. Match the existing pattern.

- [ ] **Step 2: Write the failing test for `ai.json`**

Append to `tests/unit/sources-schema.test.ts` a test like:

```ts
import { describe, it, expect } from "vitest";
import { SourceSchema, SOURCE_IDS } from "@/data/sources.schema";
import aiJson from "@/data/sources/ai.json";

describe("ai source", () => {
  it("registers 'ai' in SOURCE_IDS", () => {
    expect(SOURCE_IDS).toContain("ai");
  });

  it("ai.json parses against SourceSchema", () => {
    const parsed = SourceSchema.parse(aiJson);
    expect(parsed.id).toBe("ai");
    expect(parsed.categories.length).toBeGreaterThanOrEqual(8);
    expect(parsed.currentYear).toBe(2026);
  });

  it("ai categories use only allowed symbols", () => {
    const allowedSymbols = ["cross", "drop", "grain", "roof", "coin", "leaf", "ray"];
    const parsed = SourceSchema.parse(aiJson);
    for (const cat of parsed.categories) {
      expect(allowedSymbols).toContain(cat.symbol);
    }
  });
});
```

(If existing tests cover symbol enum across all sources via a loop, skip the third assertion — adapt to the existing style.)

- [ ] **Step 3: Run test to verify it fails**

Run:
```bash
npx vitest run tests/unit/sources-schema.test.ts
```
Expected: FAIL with `Cannot find module '@/data/sources/ai.json'` and `SOURCE_IDS does not contain "ai"`.

- [ ] **Step 4: Add `"ai"` to `SOURCE_IDS`**

Edit `data/sources.schema.ts:3`:

```ts
export const SOURCE_IDS = ["war", "tobacco", "fossil-fuels", "ai"] as const;
```

- [ ] **Step 5: Create `data/sources/ai.json`**

Use the values from Task 2 working note. Template (replace `<...>` placeholders with researched values):

```json
{
  "id": "ai",
  "labelKey": "sources.ai.label",
  "currentYear": 2026,
  "projection": {
    "totalUsd": <TOTAL_USD>,
    "basedOnYear": 2025,
    "baseAmountUsd": <BASE_USD>,
    "growthFactor": <GROWTH_FACTOR>,
    "growthBasis": "5-data-point geometric mean of annual nominal growth, derived from estimated global AI infrastructure capex 2020-2025 (hyperscaler 10-K capex guidance × AI-attributable share, plus disclosed neocloud and AI startup funding rounds), then compounded 1 year from basedOnYear (2025) to currentYear (2026). 2025 actuals based on Q4 hyperscaler earnings releases."
  },
  "historical": [
    { "year": 2025, "totalUsd": <2025_USD>, "actual": true },
    { "year": 2024, "totalUsd": <2024_USD>, "actual": true },
    { "year": 2023, "totalUsd": <2023_USD>, "actual": true },
    { "year": 2022, "totalUsd": <2022_USD>, "actual": true },
    { "year": 2021, "totalUsd": <2021_USD>, "actual": true },
    { "year": 2020, "totalUsd": <2020_USD>, "actual": true }
  ],
  "source": "<COMPOSITE_SOURCE_NAME>",
  "sourceUrl": "<CANONICAL_PROJECTION_URL>",
  "lastUpdated": "2026-05-09",
  "categories": [
    {
      "id": "dotcom-telecom-capex",
      "titleKey": "categories.ai.dotcom.title",
      "unitLabelKey": "categories.ai.dotcom.unit",
      "symbol": "coin",
      "scaleHint": "totalSolution",
      "unitCostUsd": 500000000000,
      "sources": [
        {
          "name": "<DOTCOM_SOURCE_NAME>",
          "url": "<DOTCOM_URL>",
          "year": <YEAR>
        }
      ],
      "methodology": "Aggregate private fixed investment in communications infrastructure, USA, 1996-2001, inflation-adjusted to 2024 USD (~USD 500 billion). Reflects the buildout that preceded the 2001 telecom bust."
    },
    {
      "id": "global-ai-revenue-2025",
      "titleKey": "categories.ai.aiRevenue.title",
      "unitLabelKey": "categories.ai.aiRevenue.unit",
      "symbol": "coin",
      "scaleHint": "annualNeed",
      "unitCostUsd": <AI_REVENUE_USD>,
      "sources": [
        {
          "name": "<AI_REVENUE_SOURCE_NAME>",
          "url": "<AI_REVENUE_URL>",
          "year": 2025
        }
      ],
      "methodology": "Estimated global generative-AI software and services revenue for 2025 (approx. USD 30-50 billion), per Bloomberg Intelligence / IDC Worldwide AI Spending Guide. Capex-to-revenue ratio is the most cited single bubble indicator."
    },
    {
      "id": "apollo-program",
      "titleKey": "categories.ai.apollo.title",
      "unitLabelKey": "categories.ai.apollo.unit",
      "symbol": "ray",
      "scaleHint": "totalSolution",
      "unitCostUsd": 280000000000,
      "sources": [
        {
          "name": "The Planetary Society — How much did the Apollo program cost?",
          "url": "https://www.planetary.org/space-policy/cost-of-apollo",
          "year": 2024
        }
      ],
      "methodology": "Total cumulative cost of the Apollo program (1961-1973), inflation-adjusted to 2024 USD: approximately USD 280 billion. Covers Mercury and Gemini predecessor programs, the Saturn V launch system, and all Apollo missions through Apollo 17."
    },
    {
      "id": "manhattan-project",
      "titleKey": "categories.ai.manhattan.title",
      "unitLabelKey": "categories.ai.manhattan.unit",
      "symbol": "ray",
      "scaleHint": "totalSolution",
      "unitCostUsd": 30000000000,
      "sources": [
        {
          "name": "Atomic Heritage Foundation — Manhattan Project Spending",
          "url": "https://ahf.nuclearmuseum.org/ahf/history/manhattan-project-spending/",
          "year": 2024
        }
      ],
      "methodology": "Total cost of the Manhattan Project (1942-1946), USD 1.9 billion nominal, inflation-adjusted to approximately USD 30 billion in 2024 USD per the Atomic Heritage Foundation."
    },
    {
      "id": "world-hunger",
      "titleKey": "categories.ai.hunger.title",
      "unitLabelKey": "categories.ai.hunger.unit",
      "symbol": "grain",
      "scaleHint": "annualNeed",
      "unitCostUsd": 33000000000,
      "sources": [
        {
          "name": "Nature Food / IFPRI — Investment needs to end hunger by 2030",
          "url": "https://www.nature.com/articles/s43016-020-00181-w",
          "year": 2020
        }
      ],
      "methodology": "Average additional annual public expenditure (approximately USD 33 billion) required from donors and low/middle-income governments through 2030 to end hunger (SDG 2), per Ceres2030 / IFPRI models published in Nature Food."
    },
    {
      "id": "clean-water",
      "titleKey": "categories.ai.water.title",
      "unitLabelKey": "categories.ai.water.unit",
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
      "methodology": "Annual capital investment of approximately USD 114 billion needed through 2030 to achieve universal safely managed drinking water, per the World Bank's SDG 6 costing study (Hutton & Varughese 2016)."
    },
    {
      "id": "malaria-eradication",
      "titleKey": "categories.ai.malaria.title",
      "unitLabelKey": "categories.ai.malaria.unit",
      "symbol": "drop",
      "scaleHint": "totalSolution",
      "unitCostUsd": 90000000000,
      "sources": [
        {
          "name": "The Lancet Commission on Malaria Eradication",
          "url": "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)31139-0/fulltext",
          "year": 2019
        }
      ],
      "methodology": "Total cumulative additional global investment required to eradicate malaria by 2030 (approximately USD 90-120 billion), per the Lancet Commission's modelled additional funding on top of current spending."
    },
    {
      "id": "us-grid-modernization",
      "titleKey": "categories.ai.grid.title",
      "unitLabelKey": "categories.ai.grid.unit",
      "symbol": "ray",
      "scaleHint": "annualNeed",
      "unitCostUsd": 167000000000,
      "sources": [
        {
          "name": "<GRID_SOURCE_NAME>",
          "url": "<GRID_URL>",
          "year": <YEAR>
        }
      ],
      "methodology": "Estimated annual capital investment required to modernise the US power grid (transmission upgrades, distribution hardening, interconnection queue clearing) — approximately USD 167 billion per year over 30 years toward a net-zero-aligned grid, per Princeton REPEAT and DOE Grid Deployment Office estimates."
    }
  ]
}
```

**Verification of every source URL:**

```bash
for url in <URL1> <URL2> <URL3> <URL4> <URL5> <URL6> <URL7> <URL8> <CANONICAL_PROJECTION_URL>; do
  echo -n "$url → "
  curl -s -o /dev/null -w "%{http_code}\n" -L -A "Mozilla/5.0" "$url"
done
```

Any URL returning 4xx must be replaced with a live alternative before proceeding. 403 is acceptable only if the page renders normally in a browser (some publishers bot-block but serve humans — verify manually).

- [ ] **Step 6: Register in `data/sources.index.ts`**

Edit `data/sources.index.ts`:

```ts
import warJson from "@/data/sources/war.json";
import tobaccoJson from "@/data/sources/tobacco.json";
import fossilJson from "@/data/sources/fossil-fuels.json";
import aiJson from "@/data/sources/ai.json";
import { type Source, SourceSchema, type SourceId, SOURCE_IDS } from "@/data/sources.schema";

const warSource: Source = SourceSchema.parse(warJson);
const tobaccoSource: Source = SourceSchema.parse(tobaccoJson);
const fossilSource: Source = SourceSchema.parse(fossilJson);
const aiSource: Source = SourceSchema.parse(aiJson);

export const SOURCES: Record<SourceId, Source> = {
  war: warSource,
  tobacco: tobaccoSource,
  "fossil-fuels": fossilSource,
  ai: aiSource,
};

export const SOURCES_LIST: readonly Source[] = SOURCE_IDS.map((id) => SOURCES[id]);

export function getSource(id: SourceId): Source {
  return SOURCES[id];
}
```

The order of keys in the `SOURCES` object literal determines tab order in the rendered UI (`Object.keys(SOURCES)` is insertion-ordered for non-numeric string keys per ES2015). Keep `ai` last.

- [ ] **Step 7: Run schema test to verify it passes**

Run:
```bash
npx vitest run tests/unit/sources-schema.test.ts
```
Expected: PASS — three new ai-source assertions plus all existing assertions.

- [ ] **Step 8: Run typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: zero errors. The `SourceId` type now includes `"ai"`, so the `SOURCES` record literal must contain it (TS will error if missing).

- [ ] **Step 9: Stage exact files and commit**

```bash
git status   # confirm only intended changes
git add data/sources.schema.ts data/sources/ai.json data/sources.index.ts tests/unit/sources-schema.test.ts
git commit -m "$(cat <<'EOF'
feat(data): add AI source — bubble-framing capex tab with 8 categories

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds with no `* 2.*` files in the staging summary.

---

## Task 4: Add EN dictionary entries for `ai`

**Files:**
- Modify: `messages/en.json`
- Test: `tests/unit/dictionary-fallback.test.ts`

- [ ] **Step 1: Read existing dictionary test**

Run:
```bash
cat tests/unit/dictionary-fallback.test.ts
```
Note its style. Some tests likely loop over `SOURCE_IDS` from `@/data/sources.schema`, in which case adding `"ai"` to the enum (Task 3) auto-extends coverage; assertions will fail until dict keys are added. Other tests may hardcode source ids — adapt accordingly.

- [ ] **Step 2: Write/extend failing test**

Append to `tests/unit/dictionary-fallback.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import enDict from "@/messages/en.json";

describe("ai dictionary", () => {
  it("has sources.ai block with required fields", () => {
    const ai = (enDict as any).sources.ai;
    expect(ai).toBeDefined();
    expect(ai.label).toBeTypeOf("string");
    expect(ai.caption).toBeTypeOf("string");
    expect(ai.rate).toBeTypeOf("string");
    expect(ai.methodology).toBeTypeOf("string");
  });

  it("has categories.ai with all 8 short keys defined", () => {
    const cat = (enDict as any).categories.ai;
    expect(cat).toBeDefined();
    expect(cat.label).toBeTypeOf("string");
    const expectedKeys = [
      "dotcom",
      "aiRevenue",
      "apollo",
      "manhattan",
      "hunger",
      "water",
      "malaria",
      "grid",
    ];
    for (const k of expectedKeys) {
      expect(cat[k]?.title).toBeTypeOf("string");
      expect(cat[k]?.unit).toBeTypeOf("string");
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run:
```bash
npx vitest run tests/unit/dictionary-fallback.test.ts
```
Expected: FAIL — `ai is undefined`.

- [ ] **Step 4: Add `sources.ai` block to `messages/en.json`**

Within the `sources` object (after the `fossil-fuels` block), insert:

```json
"ai": {
  "label": "AI",
  "caption": "Poured into AI since January 1, {year}",
  "rate": "{perDay} per day · {perSecond} per second",
  "methodology": "Projected {year} global AI infrastructure capex — aggregated from hyperscaler FY26 capex guidance (Microsoft, Alphabet, Meta, Amazon) plus disclosed neocloud and AI startup funding. Composite source — see categories below for detail."
}
```

- [ ] **Step 5: Add `categories.ai` block to `messages/en.json`**

Within the `categories` object (after the `fossil-fuels` block), insert:

```json
"ai": {
  "label": "AI infrastructure capex {year}",
  "dotcom": {
    "title": "Repeated the dotcom telecom buildout",
    "unit": "× the entire 1996-2001 buildout"
  },
  "aiRevenue": {
    "title": "Bought every dollar of global AI revenue",
    "unit": "× annual global AI revenue, 2025"
  },
  "apollo": {
    "title": "Funded the Apollo program",
    "unit": "× the entire program"
  },
  "manhattan": {
    "title": "Funded the Manhattan Project",
    "unit": "× the entire program"
  },
  "hunger": {
    "title": "Ended world hunger",
    "unit": "years"
  },
  "water": {
    "title": "Clean water for everyone",
    "unit": "years"
  },
  "malaria": {
    "title": "Eradicated malaria globally",
    "unit": "times over"
  },
  "grid": {
    "title": "Modernised the US power grid",
    "unit": "years of US grid modernization"
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run:
```bash
npx vitest run tests/unit/dictionary-fallback.test.ts
```
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git status   # verify only messages/en.json + the test file changed
git add messages/en.json tests/unit/dictionary-fallback.test.ts
git commit -m "$(cat <<'EOF'
feat(i18n): add AI source EN dictionary entries

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add `CATEGORY_DICT_KEYS.ai` mapping

**Files:**
- Modify: `app/[locale]/dictionaries.ts`

- [ ] **Step 1: Open the file at the `CATEGORY_DICT_KEYS` constant**

Run:
```bash
grep -n "CATEGORY_DICT_KEYS" app/\[locale\]/dictionaries.ts
```
Expected: line ~60 declares the constant.

- [ ] **Step 2: Append the `ai` block**

Edit `app/[locale]/dictionaries.ts` — inside the `CATEGORY_DICT_KEYS` object, after the `"fossil-fuels": { ... }` block, insert:

```ts
ai: {
  "dotcom-telecom-capex":   "dotcom",
  "global-ai-revenue-2025": "aiRevenue",
  "apollo-program":         "apollo",
  "manhattan-project":      "manhattan",
  "world-hunger":           "hunger",
  "clean-water":            "water",
  "malaria-eradication":    "malaria",
  "us-grid-modernization":  "grid",
},
```

- [ ] **Step 3: Sanity test that lookup works**

Run an inline script:

```bash
npx tsx -e 'import("./app/[locale]/dictionaries.ts").then(({ getCategoryDictKey }) => {
  const ids = ["dotcom-telecom-capex","global-ai-revenue-2025","apollo-program","manhattan-project","world-hunger","clean-water","malaria-eradication","us-grid-modernization"];
  for (const id of ids) console.log(id, "→", getCategoryDictKey("ai", id));
})'
```

Expected: all 8 ids map to a non-null short key. If `tsx` is unavailable, skip — the next task's build step catches missing mappings via runtime errors.

- [ ] **Step 4: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/dictionaries.ts"
git commit -m "$(cat <<'EOF'
feat(i18n): map AI category ids to short dict keys

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Add e2e Playwright spec for AI tab

**Files:**
- Modify: `tests/e2e/source-switcher.spec.ts`

- [ ] **Step 1: Add a new test inside the existing `describe` block**

Append, before the closing `});` of `test.describe("source tabs", ...)`:

```ts
test("clicking AI updates URL and active tab", async ({ page }) => {
  await page.goto("/en/");
  await page.getByRole("tab", { name: /^ai$/i }).click();
  await expect(page).toHaveURL(/\?source=ai/);
  await expect(page.getByRole("tab", { name: /^ai$/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("direct ?source=ai lands on the AI tab and renders categories", async ({ page }) => {
  await page.goto("/en/?source=ai");
  await expect(page.getByRole("tab", { name: /^ai$/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  // Hero copy reflects the AI methodology.
  await expect(page.getByText(/hyperscaler FY26 capex guidance/i)).toBeVisible();
  // The first AI category renders.
  await expect(page.getByText(/Repeated the dotcom telecom buildout/i)).toBeVisible();
});
```

The `name: /^ai$/i` regex anchors are important — `name: /ai/i` would match `Modernised the US power grid` (contains "AI" in "modernized").

- [ ] **Step 2: Build the static export so Playwright has something to serve**

Run:
```bash
npm run build
```
Expected: build succeeds. Output goes to `out/`.

- [ ] **Step 3: Run only the AI specs**

Run:
```bash
npx playwright test tests/e2e/source-switcher.spec.ts --grep "AI|ai"
```

If the user is on macOS without Playwright browsers installed, run `npx playwright install` first.

Expected: both new specs pass.

- [ ] **Step 4: Run the entire e2e suite to confirm no regressions**

Run:
```bash
npx playwright test tests/e2e/source-switcher.spec.ts
```
Expected: all specs pass — the `ArrowRight cycles tabs` spec still asserts `tobacco` (correct: war is index 0, tobacco is index 1).

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/source-switcher.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): cover AI tab click and deep-link behaviour

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Local build, lint, full test sweep, Lighthouse

**Files:** none (verification only).

- [ ] **Step 1: Lint and format**

Run:
```bash
npx biome check --write data/sources/ai.json data/sources/ai.json data/sources.index.ts data/sources.schema.ts messages/en.json "app/[locale]/dictionaries.ts" tests/unit/sources-schema.test.ts tests/unit/dictionary-fallback.test.ts tests/e2e/source-switcher.spec.ts
```
Expected: clean. If formatting changed any file, stage and add to a final cleanup commit.

- [ ] **Step 2: Full unit test sweep**

Run:
```bash
npx vitest run
```
Expected: all suites pass.

- [ ] **Step 3: Full e2e sweep**

Run:
```bash
npx playwright test
```
Expected: all specs pass.

- [ ] **Step 4: Production build**

Run:
```bash
npm run build
```
Expected: success. Inspect output for warnings — particularly any reference to `useSearchParams` outside a Suspense boundary, which would indicate a regression in `app/[locale]/page.tsx`.

- [ ] **Step 5: Serve build locally and run Lighthouse**

Run in one terminal:
```bash
npx serve out -p 3030
```

In another terminal:
```bash
npx lighthouse http://localhost:3030/en/?source=ai \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile \
  --quiet --chrome-flags="--headless" \
  --output=json --output-path=./lighthouse-ai.json

cat lighthouse-ai.json | npx -y json -e 'console.log({
  perf: this.categories.performance.score * 100,
  a11y: this.categories.accessibility.score * 100,
  bestPractices: this.categories["best-practices"].score * 100,
  seo: this.categories.seo.score * 100,
  cls: this.audits["cumulative-layout-shift"].numericValue,
})'
```

Target: perf ≥ 95, all others 100, CLS = 0. If perf < 95 or CLS > 0.05, investigate before deploy. Common cause: an extra-long methodology paragraph causing reflow — adjust copy or `min-height`.

Cleanup:
```bash
rm -f lighthouse-ai.json
kill $(lsof -t -i:3030) 2>/dev/null
```

- [ ] **Step 6: Visual smoke test in browser**

Run:
```bash
npx serve out -p 3030 &
open "http://localhost:3030/en/?source=ai"
```

Manually verify:
- Tab strip shows four tabs in order: WAR, TOBACCO USE, FOSSIL FUELS, AI.
- Clicking AI updates the counter, hero caption (`Poured into AI since…`), and category list.
- All 8 categories render with sensible numbers (no `NaN`, no `Infinity`, no `undefined`).
- The dotcom row reads `1.0×` or `1×` (it's the bubble-framing message, not a bug).
- Methodology block at the bottom of the page reads correctly.

Kill the local server: `kill $(lsof -t -i:3030)`.

- [ ] **Step 7: Commit any cleanup**

```bash
git status
# If biome or other tooling reformatted files:
git add <those files>
git commit -m "chore: biome format pass"
```

---

## Task 8: Three-skill design pass — design-taste-frontend → emil-design-eng → impeccable

Per project memory (`design_skill_stack.md`), visual changes ship through this stack in order. Each agent operates on the live build (Task 7's local server still running, or restart it).

- [ ] **Step 1: design-taste-frontend pass**

Spawn the agent (subagent dispatch, fresh context):

```
Use the design-taste-frontend skill on the AI source tab at http://localhost:3030/en/?source=ai. Compare visual rhythm with the existing three tabs. Surface:
1. Caption typography & weight balance with the new "Poured into AI" copy.
2. Category row balance — the AI tab introduces longer unit strings ("× the entire 1996-2001 buildout") which may break the existing two-column ratio. Flag any rows that wrap awkwardly.
3. Methodology paragraph — composite source is wordier than SIPRI/WHO/IMF single-source paragraphs. Suggest trimming or hierarchical treatment.
4. Tab strip with 4 items on narrow viewports — does horizontal scroll feel intentional or hacked-on?

Return concrete diff suggestions. Do not modify code.
```

Implement actionable suggestions. Commit:

```bash
git add <files>
git commit -m "polish(design-taste): <summary>"
```

- [ ] **Step 2: emil-design-eng pass**

Spawn:
```
Use the emil-design-eng skill on http://localhost:3030/en/?source=ai with focus on:
1. Tab transition feel when switching to AI — fade timing, scroll behaviour.
2. Counter mounting — the AI counter starts from zero on tab switch; verify the easing matches the war/tobacco tabs.
3. Active-state press feedback on the new AI tab button — should match the existing 0.97 scale + ease curve.

Return concrete diff suggestions.
```

Implement. Commit `polish(emil-design-eng): <summary>`.

- [ ] **Step 3: impeccable pass**

Spawn:
```
Use the impeccable skill — final polish — on the AI source tab at http://localhost:3030/en/?source=ai. Look for:
1. Copy-edit nits in caption / methodology / category titles.
2. Any redundant types, unused imports, dead code introduced by the change.
3. Cross-tab consistency: does the AI methodology paragraph rhyme rhythmically with war / tobacco / fossil-fuels?

Return concrete diff suggestions.
```

Implement. Commit `polish(impeccable): <summary>`.

If any of the three agents return "no changes needed", note that explicitly in a commit-free chat update and proceed.

---

## Task 9: Open PR, deploy to production, verify

**Files:** none (deployment).

- [ ] **Step 1: Push branch**

```bash
git push -u origin feature/ai-source-tab
```

- [ ] **Step 2: Open PR**

```bash
gh pr create --title "feat: AI investment source tab — bubble-framing 4th tab" --body "$(cat <<'EOF'
## Summary
- Adds a fourth tab `ai` to the source switcher, projecting 2026 global AI infrastructure capex (~$500B) with a real-time ticker.
- 8 comparison categories mix historical bubble parallels (dotcom telecom buildout, Apollo, Manhattan Project, current AI revenue) with humanitarian/productive foil (hunger, water, malaria, US grid).
- Pure data addition — no changes to render components.

## Test plan
- [x] `npx vitest run` — schema + dictionary specs green
- [x] `npx playwright test` — 4-tab e2e suite green
- [x] Local Lighthouse on `/en/?source=ai` — perf ≥ 95, a11y/bp/seo = 100, CLS = 0
- [x] Three-skill design pass (design-taste-frontend → emil-design-eng → impeccable)

## Spec
`docs/superpowers/specs/2026-05-09-ai-source-tab-design.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Capture the PR URL printed by `gh`.

- [ ] **Step 3: Wait for CI / merge**

Per `~/.claude/CLAUDE.md` house convention:
```bash
gh pr merge <PR_NUMBER> --merge --delete-branch
```

Expected: merged with merge-commit, branch deleted. Switch back:
```bash
git checkout main && git pull
```

- [ ] **Step 4: Pre-deploy droplet safety check**

```bash
ssh couldhave-droplet 'pm2 list && free -m && nginx -t && ls /etc/nginx/sites-enabled/'
```

Expected: pinkywave green, ≥ 2 GB RAM free, nginx config valid.

- [ ] **Step 5: Build and deploy**

```bash
npm run build
rsync -avz --delete out/ couldhave-droplet:/opt/couldhave-world/out/
```

- [ ] **Step 6: Verify production**

```bash
curl -s -o /dev/null -w "/en/  HTTP %{http_code}\n" https://couldhave.world/en/
curl -s -o /dev/null -w "/en/?source=ai  HTTP %{http_code}\n" "https://couldhave.world/en/?source=ai"
curl -s "https://couldhave.world/en/?source=ai" | grep -c 'Repeated the dotcom telecom buildout'
```

Expected: both URLs return 200; the grep returns ≥ 1.

- [ ] **Step 7: Post-deploy droplet recheck**

```bash
ssh couldhave-droplet 'pm2 list && free -m'
```

Expected: pinkywave still green, no memory regression.

- [ ] **Step 8: Visual confirmation in browser**

Open `https://couldhave.world/en/?source=ai`. Confirm tab strip, counter, all 8 categories, methodology — no visual regressions on existing three tabs.

---

## Self-Review

**1. Spec coverage:**
| Spec section | Task |
|---|---|
| Tab metadata (`id: ai`, label, currentYear) | Task 3 (data file) + Task 4 (label key) |
| Counter / projection / growthFactor | Task 2 (research) + Task 3 (data) |
| Source attribution (composite) | Task 2 + Task 3 (`source` and `sourceUrl`) |
| 8 categories with unitCostUsd, sources, methodology | Task 3 (full JSON inline) |
| Dictionary structure (`sources.ai.*`, `categories.ai.*`) | Task 4 |
| Schema + index changes | Task 3 (steps 4, 6) |
| Tab list registration | Task 3 step 6 (auto-derived from `Object.keys(SOURCES)`) — covered |
| Tests (unit + e2e) | Tasks 3, 4, 6 |
| Analytics | No-op (data-driven) — verified via spec |
| Performance / CLS | Task 7 step 5 |
| Three-skill design pass | Task 8 |
| Production deploy | Task 9 |

All sections covered.

**2. Placeholder scan:**
- "Placeholder URLs in templates" → flagged explicitly in Task 2 step 9 (working notes feed Task 3); Task 3 step 5 verifies all URLs return 2xx before commit.
- "TBD" / "implement later" — none in plan.
- Three-skill agent instructions are concrete prompts, not "do design review".

**3. Type / name consistency:**
- `SOURCE_IDS` extension matches across schema, index, dict map.
- Category ids consistent across data file, dict map, dictionary keys: `dotcom-telecom-capex` ↔ `dotcom`, `global-ai-revenue-2025` ↔ `aiRevenue`, etc. — matrix verified manually.
- Symbols all in the `["cross","drop","grain","roof","coin","leaf","ray"]` enum.
- e2e regex `/^ai$/i` (anchored) — important to avoid false matches.

No issues found.

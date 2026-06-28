# Data Correction + Three New Tabs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct every inaccurate figure/citation on couldhave.world (fact-check found only 3 of 34 categories clean) and add three new spending tabs — `food-waste`, `advertising`, `gambling` — each with a verified headline figure and 7 sourced "could-have" alternatives.

**Architecture:** Data lives in `data/sources/<id>.json` (Zod-validated by `data/sources.schema.ts`, loaded via `data/sources.index.ts`). UI copy lives in `messages/<locale>.json`, mapped per category by `app/[locale]/dictionaries.ts` (`CATEGORY_DICT_KEYS`). The page wires sources through `app/[locale]/page.tsx` → `SourceSwitcher` → `SourceTabs`/`SourceHero`/`SourceCategories`. New tabs are **flat-annual** sources (no `growthFactor`, no `historical`), mirroring `tobacco`/`fossil-fuels`.

**Tech Stack:** Next.js 16 (static export), React 19, TypeScript strict, Tailwind v4, Framer Motion, Zod, Vitest (unit), Playwright (e2e), Biome.

## Global Constraints

- Source of truth for fixes: `docs/factcheck-existing-data-2026-06-28.md`. Design: `docs/superpowers/specs/2026-06-28-data-correction-and-new-tabs-design.md`.
- Shared alternatives use ONE canonical value everywhere: `world-hunger` $33B (cite Nature Comment `d41586-020-02849-6`), `clean-water` **$37.6B** (drinking-water-only), `child-vaccination` **$27B** ("every child", IA2030 costing), `extreme-poverty` **$315B** ($3/day 2021 PPP), `malaria-eradication` $90B (Gates & Chambers 2015 / WHO GTS, 2050 target), `renewable-transition` $1B/GW.
- New tabs: flat-annual (`growthFactor` & `historical` omitted), 7 categories each, **no `aiBenefit`** (ai-only). No glyph repeats in adjacent rows (symbols: `cross/drop/grain/roof/coin/leaf/ray`).
- No per-source accent colours; monochrome + single red `--accent`.
- Tab order: append new 3 after existing 4; default tab stays `ai`. `SOURCE_IDS` = `["war","tobacco","fossil-fuels","ai","food-waste","advertising","gambling"]`.
- After any data/i18n change: `npm test` green. After any UI change: `npm run e2e` green + visual screenshots. Final gate: Lighthouse 100×4, axe 0 serious/critical, all 4 locales.
- Run `npx @biomejs/biome format --write` on touched files before each commit.
- Commit style matches house convention; do not push or open PR until the user asks.

---

## Phase 1 — Part A: correct existing data

### Task A1: Canonical shared-alternative corrections (test-first)

**Files:**
- Modify: `data/sources/war.json`, `data/sources/tobacco.json`, `data/sources/fossil-fuels.json`, `data/sources/ai.json`
- Modify: `messages/en.json` (category unit strings if a unit changes)
- Test: `tests/unit/shared-alternatives.test.ts` (create)

**Interfaces:**
- Produces: corrected `unitCostUsd` constants other tabs reuse — `clean-water` `37_600_000_000`, `child-vaccination` `27_000_000_000`, `extreme-poverty` `315_000_000_000`.

- [ ] **Step 1: Write failing test** — `tests/unit/shared-alternatives.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { SOURCES } from "@/data/sources.index";

const findCat = (sid: string, cid: string) =>
  SOURCES[sid as keyof typeof SOURCES].categories.find((c) => c.id === cid);

describe("canonical shared alternatives", () => {
  it("clean-water is the drinking-water-only figure ($37.6B) in every tab that uses it", () => {
    for (const sid of ["war", "tobacco", "ai"]) {
      expect(findCat(sid, "clean-water")?.unitCostUsd, sid).toBe(37_600_000_000);
    }
  });
  it("child-vaccination is the every-child figure ($27B) in war and tobacco", () => {
    for (const sid of ["war", "tobacco"]) {
      expect(findCat(sid, "child-vaccination")?.unitCostUsd, sid).toBe(27_000_000_000);
    }
  });
  it("extreme-poverty uses the $3/day shortfall ($315B) in war", () => {
    expect(findCat("war", "extreme-poverty")?.unitCostUsd).toBe(315_000_000_000);
  });
  it("world-hunger keeps $33B but no longer cites the wheat-yield DOI", () => {
    for (const sid of ["war", "tobacco", "fossil-fuels", "ai"]) {
      const c = findCat(sid, "world-hunger");
      expect(c?.unitCostUsd, sid).toBe(33_000_000_000);
      expect(c?.sources.some((s) => s.url.includes("s43016-020-00181-w")), sid).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run, verify fail** — `npx vitest run tests/unit/shared-alternatives.test.ts` → FAIL.
- [ ] **Step 3: Apply data edits.** In each json, for the shared ids set values + citations:
  - `clean-water` → `unitCostUsd: 37600000000`; methodology: "Annual capital investment of ~USD 37.6 billion needed through 2030 for universal safely-managed drinking water (SDG 6.1 component), per the World Bank's SDG 6 costing study (Hutton & Varughese 2016)." (keep handle URL `10986/23681`).
  - `child-vaccination` → `unitCostUsd: 27000000000`; methodology: "Estimated ~USD 27 billion/year to deliver a full routine immunisation schedule to every child globally, per the IA2030 costing (Carter, Sim et al., *Vaccine* 2022)."; replace the WHO IA2030 strategy URL with the costing study (`https://www.sciencedirect.com/science/article/pii/S0264410X23012829` — executor confirms exact DOI/PMC). Keep Gavi as secondary.
  - `extreme-poverty` (war) → `unitCostUsd: 315000000000`; methodology: "Annual income transfer (poverty gap) to lift everyone above the USD 3.00/day international poverty line (2021 PPP), ~USD 315 billion/year per World Bank PIP / Our World in Data."; sources → OWID total-shortfall grapher + World Bank "Poverty, Prosperity, and Planet 2024".
  - `world-hunger` (all 4) → keep `33000000000`; replace URL `s43016-020-00181-w` with `https://www.nature.com/articles/d41586-020-02849-6` (name: "Laborde et al. — Ending hunger: science must stop neglecting smallholder farmers, Nature 2020").
  - `malaria-eradication` (war, ai) → keep `90000000000`; methodology: "Total additional investment to eradicate malaria (~USD 90-120B), per Gates & Chambers 2015 'From Aspiration to Action' and WHO Global Technical Strategy; WHO targets eradication by 2050."; sources → Gates&Chambers 2015 + WHO GTS.
  - `renewable-transition` (war, fossil-fuels) → keep `1000000000`; methodology: "Capital cost to install 1 GW of utility-scale solar PV. IRENA's 2023 global weighted-average was $758/kW, so ~$1B installs ~1.3 GW — enough to power ~300,000 European homes."
- [ ] **Step 4: Update affected EN unit copy** if any unit label changed (none required — values only). Verify `messages/en.json` `categories.*.water/vaccination/poverty` units still read sensibly.
- [ ] **Step 5: Run** — `npx vitest run tests/unit/shared-alternatives.test.ts` → PASS; then `npm test` → all green.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "fix(data): correct shared alternatives (clean-water, vaccination, poverty, hunger citation)"`

### Task A2: Headline corrections

**Files:** Modify `data/sources/tobacco.json`, `data/sources/ai.json`, `data/sources/fossil-fuels.json`, `data/sources/war.json`, `messages/en.json`. Test: `tests/unit/sources-schema.test.ts` (update existing `ai` assertion), `tests/unit/headlines.test.ts` (create).

- [ ] **Step 1: Write failing test** — `tests/unit/headlines.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { SOURCES } from "@/data/sources.index";

describe("corrected headlines", () => {
  it("tobacco is $1.4T", () => {
    expect(SOURCES.tobacco.projection.totalUsd).toBe(1_400_000_000_000);
  });
  it("ai is re-based to Big-5 ~$770B", () => {
    expect(SOURCES.ai.projection.totalUsd).toBe(770_000_000_000);
    expect(SOURCES.ai.projection.baseAmountUsd).toBe(445_000_000_000);
  });
});
```

- [ ] **Step 2: Run, verify fail** → FAIL.
- [ ] **Step 3: Edit `tobacco.json`** — `totalUsd`/`baseAmountUsd` → `1400000000000`; `basedOnYear` → `2012`; `source` → "WHO / Goodchild, Nargis & d'Espaignet, *Tobacco Control* 2017 (2012 data)"; `sourceUrl` → `https://www.who.int/health-topics/tobacco`; `growthBasis` → "Annual figure used as a constant rate; not projected. WHO estimate (Goodchild et al. 2017, 2012 data): ~USD 1.4 trillion/year in healthcare costs and lost productivity, equivalent to 1.8% of global GDP."
- [ ] **Step 4: Edit `ai.json`** — `totalUsd` → `770000000000`; `baseAmountUsd` → `445000000000`; `growthFactor` → `1.7303`; `historical[2025].totalUsd` → `445000000000`; re-verify the 2020-2024 Big-5 (incl. Oracle) series via web (Epoch AI / CreditSights) and update; `source`/`sourceUrl` → Epoch AI; rewrite `growthBasis` to name the Big-5 incl. Oracle and Epoch AI as source.
- [ ] **Step 5: Edit `fossil-fuels.json`** — in `growthBasis` change "7.1% of global GDP" → "6.4% of global GDP".
- [ ] **Step 6: Edit `war.json`** (optional polish) — append to `growthBasis`: " (2025 nominal growth decelerated to ~6.2%, so this geometric-mean extrapolation is upper-leaning)."
- [ ] **Step 7: Edit `messages/en.json`** — `sources.tobacco.methodology` → "USD 1.4 trillion per year — healthcare costs and lost productivity from tobacco use, ~1.8% of global GDP. Source: WHO / Goodchild et al. 2017."; `sources.ai.methodology` → "USD 770 billion projected for 2026 — Big-Five hyperscaler (Microsoft, Amazon, Alphabet, Meta, Oracle) AI/data-centre capex. Source: Epoch AI."; `sources.fossil-fuels.methodology` → "6.4%". Also `categories.tobacco.label` and `categories.ai.label` keep `{year}` (no number embedded — verify).
- [ ] **Step 8: Update `tests/unit/sources-schema.test.ts`** — the `ai` block `expect(ai.projection.totalUsd).toBe(725_000_000_000)` → `770_000_000_000`.
- [ ] **Step 9: Run** `npm test` → green. **Commit** `fix(data): correct tobacco $1.4T, ai Big-5 $770B re-base, fossil GDP %`.

### Task A3: Per-tab category fixes (values + citations)

**Files:** Modify the 4 json + `messages/en.json`. Test: extend `tests/unit/data-sanity.test.ts` to loop all sources (below).

- [ ] **Step 1: Generalise data-sanity test** — change `tests/unit/data-sanity.test.ts` to iterate `SOURCES_LIST` asserting per-source invariants (≥6 categories, ≥1 source each, methodology >20 chars, unique ids, metric in sane symbol range). Run → may FAIL on degenerate values; that surfaces remaining issues.
- [ ] **Step 2: Apply per-item fixes** (value + methodology + citation), per `docs/factcheck-existing-data-2026-06-28.md`:
  - **war:** `cancer-treatment` keep $60000, re-cite NCI Cancer Trends "Financial Burden of Cancer Care" (Mariotto 2020), label "US/high-income full first-course"; `schools-lmic` → reframe "full 13-year schooling for one child", `unitCostUsd: 5900`, cite UNESCO 2015 "Pricing the right to education", update EN title→"Put children through school" unit→"children educated", compareUnit→"One child, full schooling"; `humanitarian-aid` → `46400000000`→`33000000000`, methodology GHO **2026** ($33B / 135M people), cite UN OCHA GHO 2026, EN unchanged ("years").
  - **tobacco:** `lung-cancer-treatment` → `80000`→`150000`, cite real-world US NSCLC cost study (PMC11940980), label "US high-income"; `smoking-cessation` keep `300`, methodology "per smoker treated / quit attempt", cite CDC PCD 2019 cost review, EN unit "people quit"→"people treated", compareUnit "One quit attempt"; `mpower-country` → `100000000`→`5000000`, methodology "annual cost for one low/middle-income country to run WHO MPOWER best-buys (~$5M; WHO FCTC investment cases ≈ $0.11/capita)", EN unit "country-years" keep, compareUnit "One country for a year"; `tb-treatment` keep `600`, drop "WHO median" wording → "rounded mid-range across LMIC provider costs"; `copd-care-year` keep `5000`, label "high-income", cite a real COPD cost-of-illness study (replace GOLD).
  - **fossil-fuels:** `clean-cooking-lmic` → `10000000000`→`8000000000`, methodology "~USD 8B/year (up from ~$2.5B today), IEA"; `climate-adaptation-africa` keep `50000000000`, re-cite UNEP Adaptation Gap 2025 / State of Climate in Africa (SSA $51B/yr); `building-retrofit` → `1500000000000`→`650000000000`, `scaleHint` `totalSolution`→`annualNeed`, methodology "~USD 650B/year deep-retrofit + efficiency for buildings (IEA NZE)", EN unit "times over"→"years"; `public-transit-cities` keep `5000000000`, re-cite ITDP BRT Planning Guide, methodology "≈ one full metro line or BRT corridor", EN title/unit "cities"→"metro lines"; `grid-storage-100gwh` → `40000000000`→`20000000000`, methodology "100 GWh utility-scale Li-ion at ~$200/kWh all-in (BNEF 2024 turnkey ~$165/kWh + EPC/grid)".
  - **ai:** `global-ai-revenue-2025` keep `50000000000`, methodology "order-of-magnitude 2025 gen-AI software/app-layer revenue (analyst estimates ~$22-104B)", drop specific BI attribution; `apollo-program` → `280000000000`→`338000000000`, methodology "total Apollo incl. Mercury/Gemini/Saturn V, ~$338B in 2025 USD (Planetary Society, NASA New Start Index)"; `manhattan-project` keep `30000000000`, methodology "USD 1.9B nominal (Brookings Atomic Audit, Schwartz 1998); inflation-adjusted to ~$30B in 2024 USD (own calculation)"; `us-grid-modernization` keep `167000000000`, re-cite Net-Zero America Final Report Summary PDF.
- [ ] **Step 3: Update EN strings** in `messages/en.json` for every title/unit/compareUnit changed above.
- [ ] **Step 4: Run** `npm test` → green. **Commit** `fix(data): correct per-tab category figures, units, and citations`.

### Task A4: aiBenefit wording fixes

**Files:** Modify `data/sources/ai.json` (aiBenefit fields). Test: extend `tests/unit/sources-schema.test.ts` aiBenefit block already asserts presence; add a regex assertion for the corrected Insilico phase.

- [ ] **Step 1: Add failing assertion** in the existing "ai aiBenefit field" describe:

```ts
it("insilico benefit says Phase I, not Phase II", () => {
  const ai = SourceSchema.parse(aiJson);
  const m = ai.categories.find((c) => c.id === "malaria-eradication");
  expect(m?.aiBenefit?.text).toMatch(/Phase I\b/);
  expect(m?.aiBenefit?.text).not.toMatch(/Phase II/);
});
```

- [ ] **Step 2: Run → fail. Edit `ai.json` aiBenefit texts:**
  - `dotcom-telecom-capex`: "only 2.7% of laid fibre was actually in use (≈90% sat dark, ~10% lit)".
  - `global-ai-revenue-2025`: "42% CAGR through 2032 for the generative-AI market".
  - `world-hunger`: "predict food crises up to 90 days ahead".
  - `malaria-eradication`: "to Phase I clinical trials in under 30 months".
  - `us-grid-modernization`: "DeepMind's machine-learning system (deep neural networks) cut Google data-centre cooling energy by up to 40%".
- [ ] **Step 3: Run** `npm test` → green. **Commit** `fix(data): correct aiBenefit factual wording`.

---

## Phase 2 — Part B: new data files + registration

### Task B1: `food-waste` tab

**Files:** Create `data/sources/food-waste.json`; Modify `data/sources.schema.ts`, `data/sources.index.ts`, `app/[locale]/dictionaries.ts`, `app/[locale]/page.tsx`, `messages/en.json`; Test: `tests/unit/sources-data.test.ts`, `tests/unit/sources-schema.test.ts`.

**Interfaces:**
- Produces: `SOURCES["food-waste"]`, dict keys `categories["food-waste"].{rutf,schoolMeals,dailyMeal,smallholder,hunger,water,foodSystems}`.

- [ ] **Step 1: Create `data/sources/food-waste.json`:**

```json
{
  "id": "food-waste",
  "labelKey": "sources.food-waste.label",
  "currentYear": 2026,
  "projection": {
    "totalUsd": 1000000000000,
    "basedOnYear": 2024,
    "baseAmountUsd": 1000000000000,
    "growthBasis": "Annual figure used as a constant rate; not projected. FAO 'Food Wastage Footprint: Full-Cost Accounting' puts the direct economic cost of food lost and wasted at ~USD 1 trillion/year, reaffirmed by UNEP's Food Waste Index Report 2024 (1.05 billion tonnes wasted in 2022)."
  },
  "source": "FAO Food Wastage Footprint; UNEP Food Waste Index Report 2024",
  "sourceUrl": "https://www.unep.org/resources/publication/food-waste-index-report-2024",
  "lastUpdated": "2026-06-28",
  "categories": [
    { "id": "rutf-malnutrition", "titleKey": "categories.food-waste.rutf.title", "unitLabelKey": "categories.food-waste.rutf.unit", "symbol": "cross", "scaleHint": "perUnit", "unitCostUsd": 80,
      "sources": [
        { "name": "UNICEF Supply Division — Ready-to-use therapeutic food (RUTF)", "url": "https://www.unicef.org/supply/ready-use-therapeutic-food-rutf", "year": 2025 },
        { "name": "Eleanor Crook Foundation — Ready-to-Use Therapeutic Food", "url": "https://eleanorcrookfoundation.org/evidence-matters/ready-to-use-therapeutic-food", "year": 2024 }
      ],
      "methodology": "Approximate full-course cost (~USD 80) to treat one child for severe acute malnutrition with a 6-8 week outpatient course of ready-to-use therapeutic food plus delivery; the RUTF commodity alone is ~USD 45 (UNICEF 2024 weighted-average $46.70/carton of 150 sachets)." },
    { "id": "school-meals", "titleKey": "categories.food-waste.schoolMeals.title", "unitLabelKey": "categories.food-waste.schoolMeals.unit", "symbol": "grain", "scaleHint": "perUnit", "unitCostUsd": 50,
      "sources": [
        { "name": "World Food Programme USA — School Meals", "url": "https://wfpusa.org/work/programs/school-meals/", "year": 2024 },
        { "name": "WFP — The State of School Feeding Worldwide 2024", "url": "https://www.wfp.org/publications/state-school-feeding-worldwide", "year": 2024 }
      ],
      "methodology": "WFP USA cost to give one child school meals for an entire school year (~USD 50), consistent with WFP's State of School Feeding Worldwide." },
    { "id": "emergency-food-ration", "titleKey": "categories.food-waste.dailyMeal.title", "unitLabelKey": "categories.food-waste.dailyMeal.unit", "symbol": "coin", "scaleHint": "perUnit", "unitCostUsd": 0.43,
      "sources": [ { "name": "WFP — Plan to support 42 million people on the brink of famine", "url": "https://www.wfp.org/stories/wfps-plan-support-42-million-people-brink-famine", "year": 2021 } ],
      "methodology": "WFP's average cost to provide one person one meal a day in famine-risk countries (~USD 0.43, 2021), covering procurement, transport, storage, distribution and monitoring." },
    { "id": "smallholder-climate-finance", "titleKey": "categories.food-waste.smallholder.title", "unitLabelKey": "categories.food-waste.smallholder.unit", "symbol": "leaf", "scaleHint": "annualNeed", "unitCostUsd": 75000000000,
      "sources": [ { "name": "IFAD — The $75 Billion Climate Finance Gap for small-scale farmers", "url": "https://www.ifad.org/en/w/opinions/the-75-billion-climate-finance-gap-an-imperfect-but-important-figure-for-small-scale-farmers", "year": 2024 } ],
      "methodology": "IFAD's ~USD 75 billion/year shortfall between current climate finance and what small-scale farmers — who grow about a third of the world's food — need to adapt." },
    { "id": "world-hunger", "titleKey": "categories.food-waste.hunger.title", "unitLabelKey": "categories.food-waste.hunger.unit", "symbol": "grain", "scaleHint": "annualNeed", "unitCostUsd": 33000000000,
      "sources": [ { "name": "Laborde et al. — Ending hunger: science must stop neglecting smallholder farmers, Nature", "url": "https://www.nature.com/articles/d41586-020-02849-6", "year": 2020 } ],
      "methodology": "Average additional ~USD 33 billion/year ($14B donors + $19B LMIC governments) through 2030 to end hunger (SDG 2), per Ceres2030 (IFPRI/IISD/Cornell)." },
    { "id": "clean-water", "titleKey": "categories.food-waste.water.title", "unitLabelKey": "categories.food-waste.water.unit", "symbol": "drop", "scaleHint": "annualNeed", "unitCostUsd": 37600000000,
      "sources": [ { "name": "World Bank — The Costs of Meeting the 2030 SDG Targets on Drinking Water, Sanitation, and Hygiene", "url": "https://openknowledge.worldbank.org/handle/10986/23681", "year": 2016 } ],
      "methodology": "~USD 37.6 billion/year capital investment for universal safely-managed drinking water (SDG 6.1 component), per the World Bank's SDG 6 costing study (Hutton & Varughese 2016)." },
    { "id": "food-systems-transformation", "titleKey": "categories.food-waste.foodSystems.title", "unitLabelKey": "categories.food-waste.foodSystems.unit", "symbol": "coin", "scaleHint": "annualNeed", "unitCostUsd": 400000000000,
      "sources": [ { "name": "IFAD — Transforming Global Food Systems: $400 billion needed per year", "url": "https://www.ifad.org/en/w/news/transforming-global-food-systems-400-billion-needed-per-year-while-doing-nothing-could-cost-12-trillion", "year": 2023 } ],
      "methodology": "IFAD's estimate of ~USD 400 billion/year additional investment to make global food systems sustainable, equitable and resilient (inaction could cost ~USD 12 trillion/year)." }
  ]
}
```

- [ ] **Step 2: Register** — `data/sources.schema.ts` line 3: `SOURCE_IDS = ["war","tobacco","fossil-fuels","ai","food-waste"] as const;` (advertising/gambling added in B2/B3). `data/sources.index.ts`: `import foodWasteJson from "@/data/sources/food-waste.json"; const foodWasteSource = SourceSchema.parse(foodWasteJson);` and add `"food-waste": foodWasteSource` to `SOURCES`.
- [ ] **Step 3: dictionaries + page** — `CATEGORY_DICT_KEYS["food-waste"] = { "rutf-malnutrition":"rutf","school-meals":"schoolMeals","emergency-food-ration":"dailyMeal","smallholder-climate-finance":"smallholder","world-hunger":"hunger","clean-water":"water","food-systems-transformation":"foodSystems" };` In `page.tsx` add `"food-waste": dict.categories["food-waste"]` to `switcherProps.categoriesDict`.
- [ ] **Step 4: EN i18n** — add to `messages/en.json`:

```json
"food-waste": {
  "label": "Food wasted",
  "caption": "Wasted on uneaten food since January 1, {year}",
  "rate": "{perDay} per day · {perSecond} per second",
  "methodology": "USD 1 trillion per year — the direct economic value of food lost and wasted worldwide. Source: FAO Food Wastage Footprint, reaffirmed by UNEP Food Waste Index Report 2024."
}
```
under `sources`, and under `categories`:
```json
"food-waste": {
  "label": "Food wasted {year}",
  "rutf": { "title": "Treated children for severe malnutrition", "unit": "children", "compareUnit": "One full course of therapeutic food" },
  "schoolMeals": { "title": "School meals for a child for a year", "unit": "child-years", "compareUnit": "One child fed for a school year" },
  "dailyMeal": { "title": "Fed hungry people for a day", "unit": "meals", "compareUnit": "One day of meals" },
  "smallholder": { "title": "Closed the farmers' climate-finance gap", "unit": "years" },
  "hunger": { "title": "Ended world hunger", "unit": "years" },
  "water": { "title": "Clean drinking water for everyone", "unit": "years" },
  "foodSystems": { "title": "Transformed the world's food systems", "unit": "years" }
}
```

- [ ] **Step 5: Tests** — in `sources-data.test.ts` add a `describe("data/sources/food-waste.json")` (parse, `id==="food-waste"`, `categories.length>=6`). In `sources-schema.test.ts` update `expect(SOURCE_IDS).toEqual([...])` to include `"food-waste"`.
- [ ] **Step 6: Run** `npm test` → green; `npm run dev`, open `/en/?source=food-waste`, confirm tab renders. **Commit** `feat(data): add food-waste tab`.

### Task B2: `advertising` tab

Same shape as B1.

- [ ] **Step 1: Create `data/sources/advertising.json`** — flat-annual, `totalUsd 1300000000000`, `basedOnYear 2026`, `source "WARC — Global Ad Trends"`, `sourceUrl` = WARC primary press page (executor confirms exact URL), `growthBasis` "Annual figure; not projected. WARC Global Ad Trends (December 2025) forecasts ~USD 1.3 trillion global advertising spend in 2026." Categories (ids/symbols/scaleHint/values):
  - `mental-health-care-gap` cross annualNeed `9800000000` (WHO 2016 + Chisholm Lancet Psychiatry 2016)
  - `education-financing-gap` roof annualNeed `97000000000` (UNESCO GEM 2023)
  - `who-annual-budget` coin perUnit `3417000000` (WHO PB 2024-2025, WHA76.1)
  - `malaria-rd-funding` ray perUnit `673000000` (PATH/Policy Cures 2018)
  - `child-vaccination` drop annualNeed `27000000000` (IA2030 costing)
  - `world-hunger` grain annualNeed `33000000000` (Nature d41586)
  - `clean-water` drop annualNeed `37600000000` (World Bank 2016)

  Methodologies copied from the canonical/research text (see fact-check report). Order as listed (no adjacent glyph repeat: cross,roof,coin,ray,drop,grain,drop ✓).
- [ ] **Step 2: Register** — `SOURCE_IDS` append `"advertising"`; index import+parse+add.
- [ ] **Step 3: dictionaries+page** — `CATEGORY_DICT_KEYS["advertising"] = { "mental-health-care-gap":"mentalHealth","education-financing-gap":"education","who-annual-budget":"who","malaria-rd-funding":"malariaRd","child-vaccination":"vaccination","world-hunger":"hunger","clean-water":"water" };` page categoriesDict += advertising.
- [ ] **Step 4: EN i18n** — `sources.advertising` (label "Advertising", caption "Spent on advertising since January 1, {year}", rate, methodology "USD 1.3 trillion projected for 2026 — total global advertising spend. Source: WARC Global Ad Trends, December 2025.") + `categories.advertising` (label "Advertising spend {year}"; mentalHealth "Treated depression and anxiety worldwide"/"years"; education "Closed the global education funding gap"/"years"; who "Funded the entire World Health Organization"/"annual budgets"/compareUnit "One year of the WHO's budget"; malariaRd "Funded all malaria research"/"years of R&D"/compareUnit "One year of global malaria R&D"; vaccination "Vaccinated every child on Earth"/"years"; hunger "Ended world hunger"/"years"; water "Clean drinking water for everyone"/"years").
- [ ] **Step 5: Tests** — add `sources-data.test.ts` block; update `SOURCE_IDS` toEqual.
- [ ] **Step 6: Run** `npm test` → green; verify `/en/?source=advertising`. **Commit** `feat(data): add advertising tab`.

### Task B3: `gambling` tab

- [ ] **Step 1: Create `data/sources/gambling.json`** — flat-annual, `totalUsd 573000000000`, `basedOnYear 2024`, `source "H2 Gambling Capital"`, `sourceUrl "https://h2gc.com/news/general/global-gambling-industry-generates-536bn-in-2023-with-7-growth-expected-in-2024"`, `growthBasis` "Annual figure; not projected. H2 Gambling Capital estimate of total global gross gaming revenue (player losses, not turnover) for 2024, ~USD 573B, applying ~7% growth to the 2023 actual of $536B." Categories:
  - `gambling-disorder-treatment` cross perUnit `9000` (Massachusetts APCD, PubMed 29068825)
  - `permanent-supportive-housing` roof perUnit `13000` (Third Door Coalition 2023)
  - `mental-health-financing-gap` coin annualNeed `200000000000` (United for Global Mental Health 2023)
  - `suicide-crisis-lifeline` cross perUnit `255000000` (SAMHSA/HHS 2026)
  - `world-hunger` grain annualNeed `33000000000` (Nature d41586)
  - `extreme-poverty` coin annualNeed `315000000000` (OWID/WB PIP $3/day; WB Poverty Prosperity Planet 2024)
  - `clean-water` drop annualNeed `37600000000` (World Bank 2016)

  Order: cross,roof,coin,cross,grain,coin,drop (cross at 1&4 sep, coin at 3&6 sep ✓).
- [ ] **Step 2: Register** — `SOURCE_IDS` append `"gambling"` (now full 7). Index import+parse+add.
- [ ] **Step 3: dictionaries+page** — `CATEGORY_DICT_KEYS["gambling"] = { "gambling-disorder-treatment":"treatment","permanent-supportive-housing":"housing","mental-health-financing-gap":"mentalHealth","suicide-crisis-lifeline":"lifeline","world-hunger":"hunger","extreme-poverty":"poverty","clean-water":"water" };` page categoriesDict += gambling (now all 7 present).
- [ ] **Step 4: EN i18n** — `sources.gambling` (label "Gambling", caption "Gambled away since January 1, {year}", rate, methodology "USD 573 billion per year — global gambling losses (gross gaming revenue). Source: H2 Gambling Capital, 2024.") + `categories.gambling` (label "Gambling losses {year}"; treatment "A year of care for problem gamblers"/"people"/compareUnit "One person, one year of care"; housing "Housed homeless people for a year"/"people"/compareUnit "One person housed for a year"; mentalHealth "Closed the mental-health funding gap"/"years"; lifeline "Ran national crisis lifelines"/"years"/compareUnit "One year of a national lifeline"; hunger "Ended world hunger"/"years"; poverty "Lifted everyone out of extreme poverty"/"years"; water "Clean drinking water for everyone"/"years").
- [ ] **Step 5: Tests** — add `sources-data.test.ts` block; finalise `SOURCE_IDS` toEqual to the full 7. Update `tests/unit/dictionary-fallback.test.ts` to assert the 3 new `sources.<id>` blocks have string label/caption/rate/methodology in EN.
- [ ] **Step 6: Run** `npm test` → green; verify `/en/?source=gambling`. **Commit** `feat(data): add gambling tab`.

---

## Phase 3 — UI

### Task C1: TickingCounter clamp fix

**Files:** Modify `components/hero/TickingCounter.tsx:52`. Test: `tests/e2e/counter.spec.ts` (mobile viewport overflow check).

- [ ] **Step 1: Add failing e2e** — in `counter.spec.ts`, at 375px width, assert the counter's `scrollWidth <= clientWidth` of its container (no horizontal overflow). Run → may FAIL on war/fossil.
- [ ] **Step 2: Edit line 52** — `style={{ fontSize: "clamp(40px, 12vw, 220px)" }}`.
- [ ] **Step 3: Run e2e** → PASS at 375px for all tabs (check `?source=war` and `?source=fossil-fuels`). **Commit** `fix(hero): lower counter clamp floor to 40px for mobile`.

### Task C2: SourceTabs Variant B (wrap + chip on mobile)

**Files:** Modify `components/sources/SourceTabs.tsx`. Test: `tests/e2e/source-switcher.spec.ts`.

- [ ] **Step 1: Update e2e** — fix order-dependent assertions (ArrowRight from `ai` now → `food-waste`; from `gambling` → `war`). Add a test at 375px that all 7 tabs are visible (each tab's `boundingBox` within viewport — wrap, not clipped).
- [ ] **Step 2: Rewrite container + button classes** for Variant B:
  - Container: `role="tablist"` className → `"flex flex-wrap gap-x-5 gap-y-2 md:gap-8 md:flex-nowrap md:overflow-x-auto md:scrollbar-none md:border-b md:border-[var(--border-color)] mb-10 md:mb-16"`.
  - Button: replace the underline-only active block with breakpoint-aware classes. Base: `"font-mono text-xs md:text-sm uppercase tracking-[0.18em] whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]/30"`. Mobile chip + desktop underline:
    - active: `"rounded-full px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg)] md:bg-transparent md:text-[var(--text-primary)] md:rounded-none md:px-0 md:py-3 md:border-b-2 md:border-[var(--text-primary)] md:-mb-px"`
    - inactive: `"rounded-full px-3 py-1.5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:border-0 md:border-b-2 md:border-transparent md:rounded-none md:px-0 md:py-3"`
  - Verify `--bg` token exists in `globals.css`; if the page background token is named differently, use that. (Inverted chip text must read against `--text-primary` fill.)
- [ ] **Step 3: Fix stale comment + add scrollIntoView.** Update the doc-comment to describe wrap/chip behaviour (remove the false fade-mask promise). Add `ref` to the active button and `useEffect(() => activeRef.current?.scrollIntoView({ inline: "nearest", block: "nearest" }), [activeId])` so a deep-linked late tab is visible on desktop's `md:overflow-x-auto` row.
- [ ] **Step 4: Run** `npm run e2e` → green (all 7 tabs, arrow nav, deep-link). Screenshot 375/393/430/desktop. **Commit** `feat(switcher): wrap to chips on mobile, single row on desktop (7 tabs)`.

### Task C3: Design-skill polish pass

- [ ] **Step 1:** Run `design-taste-frontend` on the switcher + any touched component.
- [ ] **Step 2:** Run `emil-design-eng` (motion/interaction details).
- [ ] **Step 3:** Run `impeccable` final pass.
- [ ] **Step 4:** Capture screenshots per Maya's acceptance checklist (each new tab at 375/393/430/desktop; active indicator correct in both modes; counter no overflow; no adjacent duplicate glyphs; no "0.0×"/empty matrix). Fix any findings. **Commit** `polish: design-stack pass on new tabs + switcher`.

---

## Phase 4 — Translations

### Task D1: es / de / fr for new tabs + corrected strings

**Files:** Modify `messages/es.json`, `messages/de.json`, `messages/fr.json`.

- [ ] **Step 1:** For each locale, add `sources.{food-waste,advertising,gambling}` and `categories.{food-waste,advertising,gambling}` mirroring the EN keys, translated. Also update any existing strings changed in Phase 1 (tobacco/ai methodology, retrofit/transit/schools units, etc.).
- [ ] **Step 2:** Dispatch translation per locale (subagent or manual), keeping `{year}/{perDay}/{perSecond}` placeholders intact and matching the terse register of existing translations.
- [ ] **Step 3:** Run `npm test` (`dictionary-fallback` + any locale tests) → green. **Commit** `i18n: translate new tabs + corrected strings (es/de/fr)`.

---

## Phase 5 — Verification

### Task E1: Full gate + per-source plumbing

**Files:** Check `scripts/` (OG image gen), `app/sitemap.ts`, `app/robots.ts`, `lib/site-config.ts`.

- [ ] **Step 1:** Grep these for hardcoded source lists; if OG/sitemap iterate sources, confirm the 3 new ids flow through (and OG images generate for them). Patch if needed.
- [ ] **Step 2:** `npm test && npm run e2e` → all green.
- [ ] **Step 3:** `npm run build` → static export succeeds for all locales.
- [ ] **Step 4:** Lighthouse (100×4) + axe (0 serious/critical) on `/en/` with each `?source=` + the 3 other locales' default. Device screenshots.
- [ ] **Step 5:** Update `README.md` "ten alternatives" / source count language to reflect 7 tabs. **Commit** `chore: verify build, a11y, perf; update README for 7 tabs`.

---

## Self-Review

- **Spec coverage:** Part A headlines (A2), shared alts (A1), per-tab categories (A3), aiBenefits (A4) ✓. Part B 3 data files + registration + EN i18n (B1-3) ✓; switcher Variant B (C2) ✓; counter clamp (C1) ✓; tests (each task) ✓; translations (D1) ✓; design-stack + Maya checklist (C3) ✓; build/a11y/plumbing (E1) ✓.
- **Placeholder scan:** Two deliberate executor-confirms remain — exact WARC primary URL (B2) and the IA2030 costing study DOI (A1/B2); both name the source and a search target. AI Big-5 historicals (A2) require a web re-verify step (explicit). These are research lookups, not vague TODOs.
- **Type consistency:** `SOURCE_IDS` extended consistently; `CATEGORY_DICT_KEYS` keys match each json's category ids; `switcherProps.categoriesDict` keys match `SOURCES`. Shared values (37.6B/27B/315B/33B) identical across A1, B1-3.

# Design — Data correction + three new spending tabs (couldhave.world)

**Date:** 2026-06-28
**Status:** awaiting user review
**Companion docs:** `docs/factcheck-existing-data-2026-06-28.md` (full per-claim evidence)

## Goal

Two intertwined workstreams, decided together because they share canonical values:

- **Part A — Correct existing data.** A 80-agent fact-check found ~30 issues across the 4 existing tabs (only 3 of 34 categories fully clean). Apply all fixes so every number on the site is honest and every citation supports its claim.
- **Part B — Add three new tabs (`source`s).** `food-waste`, `advertising`, `gambling` — each a top-level spending subject like war/tobacco/fossil-fuels/ai, with a headline figure and ~7 verified "could-have" alternatives.

**User decisions locked in brainstorming:**
1. **Fix scope:** correct *all* issues (not just the worst).
2. **Shared mislabeled figures:** *match the number to the simple label* ("цифра под ярлык / честно") — e.g. clean-water → drinking-water-only $37.6B, not WASH $114B.
3. **New tabs:** approved the proposed 7-category sets + Maya's design decisions; write the spec.

## Non-goals (YAGNI)

- No per-source accent colours (Maya: keep monochrome + single red `--accent`).
- No new symbol glyphs (existing enum `cross/drop/grain/roof/coin/leaf/ray` is sufficient).
- No projection/growth model for new tabs — they are **flat-annual** like tobacco/fossil-fuels (`growthFactor` omitted, `historical` omitted).
- No redesign of CategoryRow / SymbolMatrix / ComparisonBars internals.

---

## Canonical shared alternatives (one corrected version, reused everywhere)

These appear across multiple tabs (existing + new). Per decision #2, each gets ONE corrected value + citation, applied site-wide:

| id | corrected value | scaleHint | citation fix |
|---|---|---|---|
| `world-hunger` | **$33B/yr** (unchanged) | annualNeed | replace wheat-paper DOI `s43016-020-00181-w` → Nature Comment `d41586-020-02849-6` (or IISD/CGIAR Ceres2030) |
| `clean-water` | **$37.6B/yr** (was $114B) | annualNeed | Hutton & Varughese 2016, **SDG 6.1 drinking-water component only** |
| `child-vaccination` | **$27B/yr** (was $9.5B) | annualNeed | "fully immunise every child", IA2030 costing study (Carter/Sim et al., *Vaccine* 2022) — replace non-costing WHO IA2030 strategy page |
| `extreme-poverty` | **$315B/yr** (was $100B) | annualNeed | $3.00/day (2021 PPP) line; OWID/World Bank PIP total-shortfall (WB retired $2.15/day in June 2025) |
| `malaria-eradication` | **$90B** (unchanged magnitude) | totalSolution | re-attribute to Gates & Chambers 2015 / WHO GTS; fix "by 2030" → eradication by 2050 |
| `rainforest-protection` | **[confirm]** ~$27B (1.07B ha rainforest × sourced $/ha) | totalSolution | fix dead FAO link; re-cite a real per-ha protection cost; "rainforest" = ~1.07B ha (not 1.8B ha all-tropical-forest) |
| `renewable-transition` | **$1B/GW** (unchanged) | perUnit | reword: IRENA 2023 $758/kW → "$1B installs ~1.3 GW, powers ~300k European homes" |

---

## Part A — existing-data corrections

Full evidence per item is in `docs/factcheck-existing-data-2026-06-28.md`. Summary of changes:

### Headlines
- **`tobacco`** 🔴 — `totalUsd`/`baseAmountUsd` $1.7T → **$1.4T**; `basedOnYear` 2012; source → "WHO / Goodchild et al., *Tobacco Control* 2017 (2012 data)"; rewrite `growthBasis` (1.8% of GDP, not 1.7%; no "2022 update"). Update i18n `sources.tobacco.methodology`, `categories.tobacco.label`, hero copy.
- **`ai`** 🟡 — **keep "Big Five" (incl. Oracle), re-base the figures.** `totalUsd` $725B → **~$770B** (Epoch AI, 5 firms, 2026); `baseAmountUsd` $380B → **~$445B** (2025 5-company actual); `growthFactor` → **~1.73** (770/445, basedOnYear 2025 → 2026); `historical[2025]` → ~$445B. Re-verify the full 2020–2025 Big-5 series (incl. Oracle) during implementation; cite Epoch AI. Update i18n `sources.ai.methodology`.
- **`fossil-fuels`** — text only: `growthBasis` + i18n "7.1% of GDP" → **"6.4%"**.
- **`war`** — optional polish: caveat that 2025 nominal growth decelerated to ~6.2%; add SIPRI PDF link.

### Categories (per tab — value + citation/wording)
- **war:** `cancer-treatment` keep ~$60k, re-cite (NCI/Mariotto 2020), label "US/high-income"; `malaria-eradication`, `world-hunger`, `clean-water`, `child-vaccination`, `extreme-poverty`, `rainforest-protection`, `renewable-transition` → canonical (above); `schools-lmic` → **reframe** "put a child through full schooling (13-yr cycle)" ~$5,900 *[confirm]*; `humanitarian-aid` → **GHO 2026 $33B / 135M** (was GHO 2024 $46.4B).
- **tobacco:** `lung-cancer-treatment` → ~$150k US real-world cost study *[confirm]*; `smoking-cessation` keep $300, relabel "per smoker treated / quit attempt" (unit "people quit"→"people treated"), real pricing cite; `mpower-country` → **reframe** (defensible ~$5M/yr single LMIC or per-capita $0.11) — was 25–100× too high *[confirm]*; `tb-treatment` keep $600 as LMIC mid-range, drop "WHO median" attribution; `copd-care-year` keep ~$5k, label "high-income", real cost-of-illness cite (GOLD has no cost data); `child-vaccination`,`world-hunger`,`clean-water` → canonical.
- **fossil-fuels:** `renewable-transition`,`rainforest-protection`,`world-hunger` → canonical; `clean-cooking-lmic` $10B → **$8B** (IEA); `climate-adaptation-africa` keep ~$50B, re-cite UNEP Africa report; `building-retrofit` $1.5T → **~$650B/yr** (annualNeed, IEA NZE deep-retrofit+efficiency); `public-transit-cities` keep $5B, re-cite ITDP BRT guide, reword "covering a city" → "≈ one metro line / BRT corridor"; `grid-storage-100gwh` $40B → **~$20B** (BNEF turnkey ~$200/kWh all-in).
- **ai:** `dotcom-telecom-capex` ✅ no change; `global-ai-revenue-2025` keep ~$50B, relabel "order-of-magnitude estimate" (drop specific BI attribution); `apollo-program` $280B → **$338B** (incl. Mercury/Gemini, 2025 USD); `manhattan-project` keep ~$30B, reword methodology (separate Brookings $1.9B nominal from own inflation calc); `world-hunger`,`clean-water`,`malaria-eradication` → canonical; `us-grid-modernization` keep $167B, re-cite NZA Final Report PDF.

### AI benefits (ai tab counter-facts)
- `dotcom` "2.7% lit" → "2.7% in use (~10% lit)"; `global-ai-revenue` "software revenue" → "the genAI market"; `world-hunger`/HungerMap "60 days" → "90 days"; `malaria`/Insilico **"Phase II" → "Phase I"**; `us-grid`/DeepMind "RL controller" → "ML / deep neural networks". `apollo`,`manhattan`,`clean-water` ✅ unchanged.

---

## Part B — three new tabs

### Data files (`data/sources/<id>.json`), flat-annual

**`food-waste`** — headline **~$1T/yr** (FAO Food Wastage Footprint, reaffirmed UNEP Food Waste Index 2024)

| # | id | title | unit | symbol | scaleHint | unitCostUsd |
|---|---|---|---|---|---|---|
|1| `rutf-malnutrition` | Treat a child for severe malnutrition | child | cross | perUnit | 80 |
|2| `school-meals` | A year of school meals for a child | child-years | grain | perUnit | 50 |
|3| `emergency-food-ration` | Feed a hungry person for a day | person-days | coin | perUnit | 0.43 |
|4| `smallholder-climate-finance` | Close the farmers' climate-finance gap | years | leaf | annualNeed | 75000000000 |
|5| `world-hunger` | End world hunger | years | grain | annualNeed | 33000000000 |
|6| `clean-water` | A year of clean drinking water | years | drop | annualNeed | 37600000000 |
|7| `food-systems-transformation` | Transform the world's food systems | years | coin | annualNeed | 400000000000 |

**`advertising`** — headline **~$1.3T/yr** (WARC Global Ad Trends, 2026 forecast — cite WARC primary, not the blog mirror)

| # | id | title | unit | symbol | scaleHint | unitCostUsd |
|---|---|---|---|---|---|---|
|1| `mental-health-care-gap` | Treat depression & anxiety worldwide | years | cross | annualNeed | 9800000000 |
|2| `education-financing-gap` | Close the global education funding gap | years | roof | annualNeed | 97000000000 |
|3| `who-annual-budget` | Fund the entire WHO | annual budgets | coin | perUnit | 3417000000 |
|4| `malaria-rd-funding` | Fund all global malaria research | years | ray | perUnit | 673000000 |
|5| `child-vaccination` | Vaccinate every child on Earth | years | drop | annualNeed | 27000000000 |
|6| `world-hunger` | End world hunger | years | grain | annualNeed | 33000000000 |
|7| `clean-water` | A year of clean drinking water | years | drop | annualNeed | 37600000000 |

**`gambling`** — headline **~$573B/yr** (H2 Gambling Capital 2024, gross gaming revenue = player losses)

| # | id | title | unit | symbol | scaleHint | unitCostUsd |
|---|---|---|---|---|---|---|
|1| `gambling-disorder-treatment` | A year of care for someone with gambling disorder | people | cross | perUnit | 9000 |
|2| `permanent-supportive-housing` | House a homeless person for a year | person-years | roof | perUnit | 13000 |
|3| `mental-health-financing-gap` | Close the global mental-health funding gap | years | coin | annualNeed | 200000000000 |
|4| `suicide-crisis-lifeline` | Run a national suicide & crisis lifeline | years | cross | perUnit | 255000000 |
|5| `world-hunger` | End world hunger | years | grain | annualNeed | 33000000000 |
|6| `extreme-poverty` | Lift everyone above the poverty line | years | coin | annualNeed | 315000000000 |
|7| `clean-water` | A year of clean drinking water | years | drop | annualNeed | 37600000000 |

Symbol order in each table is set so no glyph repeats in adjacent rows (Maya rule). No `aiBenefit` blocks (ai-only).

### Registration changes
- `data/sources.schema.ts` — `SOURCE_IDS` → `["war","tobacco","fossil-fuels","ai","food-waste","advertising","gambling"]` (append; default tab stays `ai`).
- `data/sources.index.ts` — import + `SourceSchema.parse` the 3 files; add to `SOURCES` record + `SOURCES_LIST`.
- `app/[locale]/dictionaries.ts` — add 3 maps to `CATEGORY_DICT_KEYS`.
- `app/[locale]/page.tsx` — extend `switcherProps.categoriesDict` from 4 → 7 keys (currently hardcoded).

### i18n (all 4 locales)
- `messages/{en,es,de,fr}.json`: for each new source add `sources.<id>` (label/caption/rate/methodology) + `categories.<id>` (label + per-category title/unit; `compareUnit` for perUnit rows). EN authored first; es/de/fr translated (≈180 strings total). `withFallback` covers any gaps but launch target is full translation.
- Captions follow the verb-first house style: e.g. food-waste "Wasted on uneaten food since January 1, {year}", advertising "Spent on advertising since January 1, {year}", gambling "Gambled away since January 1, {year}".

### Switcher redesign — Maya **Variant B**
- `components/sources/SourceTabs.tsx`: desktop (≥`md`) = single row (7 tabs ≈ 814px < 1056px ✓); mobile (<`md`) = **flex-wrap chips**. Active indicator: keep 2px underline on desktop; switch to ghost-chip (inverted fill, `rounded-full`) on wrap so the bottom-border indicator doesn't break.
- Fix the stale doc-comment promising a fade-mask (either implement the mask or remove the promise).
- `scrollIntoView` the active tab on mount (deep-link to a later tab must be visible).
- Preserve roving tabindex + Arrow-key nav across 7 tabs.

### Counter fix (pre-existing mobile bug new tabs inherit)
- `components/hero/TickingCounter.tsx`: lower clamp floor `clamp(56px,12vw,220px)` → **`clamp(40px,12vw,220px)`** so 18-digit war/fossil values stop overflowing on 375px phones. Verify on a real device (simulator metrics lie). New tabs are 16-digit (narrower), so no new desktop risk.
- January edge-case: verify no large-ticket alternative renders "0.0×" / empty matrix early in the year (gambling has the lowest headline). All gambling perUnit items are small ($255M max for an annualNeed); fine.

### Tests
- `tests/unit/sources-schema.test.ts` — ⚠️ `expect(SOURCE_IDS).toEqual([...4...])` **must** update to 7; add per-source parse/shape blocks for the 3 new ids.
- `tests/unit/sources-data.test.ts` — add describe blocks (parse, id, ≥6 categories) for each new file.
- `tests/unit/data-sanity.test.ts` — extend invariants (sources ≥1 citation, methodology length, unique ids, sane matrix) across all 7 sources, not just war.
- `tests/unit/dictionary-fallback.test.ts` — add coverage that new sources' dict keys resolve in all locales.
- `tests/e2e/source-switcher.spec.ts` — update tab-order assumptions (ArrowRight cycle now ends at `gambling`→`war`); add a mobile-wrap visibility check.
- Check `scripts/` (OG image generation), `app/sitemap.ts`, `app/robots.ts`, `lib/site-config.ts` for per-source logic that needs the 3 new ids.

### Visual sign-off
- Run the **design-taste-frontend → emil-design-eng → impeccable** stack on the switcher + any touched component before shipping (project memory). Screenshot each new tab at 375 / 393 / 430 / desktop per Maya's acceptance checklist.

---

## Implementation order (for the plan)
1. Part A canonical shared corrections + per-tab data/i18n fixes (data only; tests green).
2. New data files + registration + EN i18n; unit tests.
3. Switcher Variant B + counter clamp; e2e + visual.
4. es/de/fr translations.
5. Full verification: `npm test && npm run e2e`, Lighthouse, axe, device screenshots.

## Open items — RESOLVED (user review, 2026-06-28)
- ✅ AI headline: **Big-5 re-base to ~$770B** (Epoch AI), base ~$445B (2025), growthFactor ~1.73, re-verify Big-5 historicals.
- ✅ `schools-lmic`: reframe to **full 13-yr schooling (~$5,900)**.
- ✅ `tobacco/lung-cancer`: **~$150k US** with a real-world cost study.
- ✅ `tobacco/mpower-country`: reframe to **~$5M/yr single LMIC** (defensible).
- ✅ `rainforest-protection`: **~$27B** (1.07B ha rainforest) after re-sourcing per-ha cost.
- ✅ Tab order: **append** the 3 new tabs; default tab stays `ai`.

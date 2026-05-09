# AI source tab — design spec

**Date:** 2026-05-09
**Status:** Approved (pending implementation)
**Predecessor:** `2026-04-29-source-tabs-design.md` (introduced the multi-source tab system)

## Context

The landing page currently exposes three sources via tabs: `war`, `tobacco`, `fossil-fuels`. Each tab fully replaces the hero counter + comparison categories. Data is data-driven — adding a fourth source requires no changes to `SourceTabs`, `SourceHero`, `SourceCategories`, or `SourceSwitcher` components.

This spec adds a fourth source: **AI infrastructure investment**, framed around the implicit question "is this a bubble?". Unlike the prior three (war / tobacco / fossil fuels), AI capex is not editorially "wasteful" in the same sense. The page does not answer the bubble question; it presents the scale and historical parallels and lets the reader judge.

## Goals

1. Add a fourth tab (`ai`) showing 2026 projected global AI infrastructure capex, with a real-time ticking counter consistent with the existing three sources.
2. Framing is **neutral**: caption uses "Poured into AI" rather than "Spent on" / "Lost to" / "Subsidising".
3. Categories deliberately mix **historical-bubble parallels** (dotcom telecom capex, Apollo, Manhattan Project, current AI revenue) with the standard humanitarian/productive foil (hunger, water, malaria, US grid modernization). The bubble framing reads through composition, not through editorial language.
4. Zero changes to existing component code — the new tab is purely additive: new data file + dictionary keys + schema enum extension.

## Non-goals

- Animating, redesigning, or restructuring the tab strip. Adding a fourth tab uses the existing horizontal scroll affordance.
- Expanding the `SymbolEnum`. The seven existing symbols (`cross / drop / grain / roof / coin / leaf / ray`) cover all eight categories below; no AI-specific glyph is introduced.
- Validating that `totalUsd ≈ baseAmountUsd × growthFactor^n` at the schema level. Same convention as war/tobacco/fossil-fuels: math lives in `growthBasis` text, not in Zod.
- Replacing or reframing existing tabs.

## Tab metadata

| Field | Value |
|---|---|
| `id` | `ai` |
| `labelKey` | `sources.ai.label` |
| Tab label (EN) | `AI` |
| Tab order | last — after `fossil-fuels` |
| `currentYear` | `2026` |
| `lastUpdated` | `2026-05-09` |

The tab strip already supports horizontal scroll on narrow viewports; four 2-12 character labels comfortably fit ≥360px.

## Counter / projection

| Field | Value | Notes |
|---|---|---|
| `projection.totalUsd` | ~`500_000_000_000` (USD 500B) | Final number subject to fact-check during implementation against latest hyperscaler FY26 guidance + Bloomberg Intelligence AI infrastructure tracker. Acceptable range $500-550B. |
| `projection.basedOnYear` | `2025` | |
| `projection.baseAmountUsd` | ~`320_000_000_000` | Estimated 2025 actual global AI capex. |
| `projection.growthFactor` | ~`1.5625` | = `totalUsd / baseAmountUsd`; aligns with 5-year geometric mean growth rate. |
| `projection.growthBasis` | (see below) | |

**`growthBasis` (draft):**
> 5-data-point geometric mean of annual nominal growth, derived from estimated global AI infrastructure capex 2020-2025 (hyperscaler 10-K capex guidance × AI-attributable share, plus disclosed neocloud and AI startup funding rounds), then compounded 1 year from `basedOnYear` (2025) to `currentYear` (2026). 2025 actuals based on Q4 hyperscaler earnings releases.

**Historical entries (2020-2025, all `actual: true`):** rough yearly totals to anchor the geometric mean. Exact numbers finalised during data file authoring; expected order of magnitude per year:

- 2020: ~$30B
- 2021: ~$50B
- 2022: ~$70B
- 2023: ~$120B
- 2024: ~$220B
- 2025: ~$320B

## Source attribution

| Field | Value |
|---|---|
| `source` | `Aggregated from hyperscaler FY26 capex guidance and Bloomberg Intelligence AI infrastructure tracker` |
| `sourceUrl` | Single canonical URL — the most authoritative published projection. Candidates: Bloomberg Intelligence's AI infrastructure note, Morgan Stanley AI Capex Tracker, Goldman Sachs AI investment outlook. Selected during implementation. |

This is a composite by necessity. Unlike SIPRI (war) / WHO (tobacco) / IMF (fossil-fuels), no single body publishes an authoritative global AI capex total. Methodology paragraph in the hero block makes the composite nature explicit.

## Categories (8 total)

Schema requires `≥6`. Eight chosen so the bubble parallels (1-4) and humanitarian foil (5-8) each carry roughly equal weight in the rendered list. Order below is the order they appear on the page.

| # | `id` | EN title | EN unit | `scaleHint` | `unitCostUsd` | `symbol` |
|---|---|---|---|---|---|---|
| 1 | `dotcom-telecom-capex` | Repeated the dotcom telecom buildout | × the entire 1996-2001 buildout | `totalSolution` | 500_000_000_000 | `coin` |
| 2 | `global-ai-revenue-2025` | Bought every dollar of global AI revenue | × annual global AI revenue, 2025 | `annualNeed` | 50_000_000_000 | `coin` |
| 3 | `apollo-program` | Funded the Apollo program | × the entire Apollo program (1961-1973) | `totalSolution` | 280_000_000_000 | `ray` |
| 4 | `manhattan-project` | Funded the Manhattan Project | × the entire Manhattan Project | `totalSolution` | 30_000_000_000 | `ray` |
| 5 | `world-hunger` | Ended world hunger | years | `annualNeed` | 33_000_000_000 | `grain` |
| 6 | `clean-water` | Clean water for everyone | years | `annualNeed` | 114_000_000_000 | `drop` |
| 7 | `malaria-eradication` | Eradicated malaria globally | × | `totalSolution` | 90_000_000_000 | `drop` |
| 8 | `us-grid-modernization` | Modernised the US power grid | years of US grid modernization | `annualNeed` | 167_000_000_000 | `ray` |

All `unitCostUsd` values are inflation-adjusted to 2024-2026 USD. Sources per category (each row needs `≥1` entry per schema):

- **dotcom-telecom-capex** — McKinsey "Reflections on the dotcom era" / Federal Reserve historical capex series; ~$500B (1996-2001) inflation-adjusted to 2024 USD.
- **global-ai-revenue-2025** — Bloomberg Intelligence / IDC AI Spending Guide; $30-50B aggregate.
- **apollo-program** — NASA budget archives; $25.8B nominal 1960s, ~$280B in 2024 USD per BLS CPI.
- **manhattan-project** — Atomic Heritage Foundation; $1.9B nominal, ~$30B in 2024 USD.
- **world-hunger** — Same as `war.world-hunger` source (Ceres2030 / Nature Food).
- **clean-water** — Same as `war.clean-water` source (World Bank SDG6 costing).
- **malaria-eradication** — Same as `war.malaria-eradication` source (Lancet Commission).
- **us-grid-modernization** — DOE Grid Deployment Office / Brattle Group; ~$5T over 30 years = ~$167B/year average.

Exact `name`/`url`/`year` triples per category source finalised during data file authoring with live-URL verification (per AGENTS.md heuristic — replace any 4xx URLs).

## Dictionary structure

`messages/en.json` gains:

```json
{
  "sources": {
    "ai": {
      "label": "AI",
      "caption": "Poured into AI since January 1, {year}",
      "rate": "{perDay} per day · {perSecond} per second",
      "methodology": "USD ~500 billion projected for 2026 — aggregated from hyperscaler FY26 capex guidance (Microsoft, Alphabet, Meta, Amazon) plus disclosed neocloud and AI startup funding. Composite source; see methodology section below."
    }
  },
  "categories": {
    "ai": {
      "label": "AI infrastructure capex {year}",
      "dotcom":      { "title": "Repeated the dotcom telecom buildout",   "unit": "× the entire 1996-2001 buildout" },
      "aiRevenue":   { "title": "Bought every dollar of global AI revenue", "unit": "× annual global AI revenue, 2025" },
      "apollo":      { "title": "Funded the Apollo program",               "unit": "× the entire program" },
      "manhattan":   { "title": "Funded the Manhattan Project",            "unit": "× the entire program" },
      "hunger":      { "title": "Ended world hunger",                      "unit": "years" },
      "water":       { "title": "Clean water for everyone",                "unit": "years" },
      "malaria":     { "title": "Eradicated malaria globally",             "unit": "times over" },
      "grid":        { "title": "Modernised the US power grid",            "unit": "years" }
    }
  }
}
```

Locale fallbacks (`es/de/fr`) inherit via the existing recursive `withFallback` merge in `app/[locale]/dictionaries.ts`. Localised AI strings can be added later — out of scope for this spec.

## Schema + index changes

**`data/sources.schema.ts`:**

```ts
export const SOURCE_IDS = ["war", "tobacco", "fossil-fuels", "ai"] as const;
```

**`app/[locale]/dictionaries.ts`** — add to `CATEGORY_DICT_KEYS`:

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

**`data/sources.index.ts`** — register `ai.json` in the parsed sources record. The Zod validation at module load catches malformed data before render.

## Tab list registration

`SOURCE_TAB_ITEMS` (or wherever the tabs are listed for `SourceSwitcher`) gains `{ id: "ai", labelKey: "sources.ai.label" }` as the fourth entry. Default tab remains `war` for cold loads / no-query-param case.

## Tests

Extend `tests/e2e/source-switcher.spec.ts` with a single new spec:

```
test("AI tab switches counter, categories, and updates ?source=ai")
```

Verifies:
- Clicking the `AI` tab updates `aria-selected`.
- The hero caption changes to the AI string.
- The category list re-renders with 8 AI categories.
- URL search param becomes `?source=ai`.
- Reload at `/?source=ai` boots into AI tab without flash of war state (the static-HTML default fallback still renders war but hydration corrects within a frame; existing test for `?source=fossil-fuels` covers the same code path).

Existing arrow-key, reduced-motion, and deep-link specs already loop over `SOURCE_IDS` — they pick up `ai` automatically via the constant. Verify no spec hard-codes `["war","tobacco","fossil-fuels"]`.

## Analytics

`Analytics.tsx` already emits `source_switch` and tags events with `initial_source` from URL. No changes — the component reads the active source via `data-mp-source` on the tab buttons, which is data-driven. The only follow-up: confirm `source` Mixpanel property values include `"ai"` once deployed (no code change needed).

## Performance

CLS protection mechanism (Suspense fallback rendering default war state in static HTML) is unchanged. Adding a fourth tab adds one more `<button>` and one more JSON file (~5 KB minified) — negligible.

Lighthouse target: same as current production (99/100/100/100). Re-run after merge to confirm no regression.

## Out-of-scope (deferred)

- Localised AI strings for `es/de/fr` (fallback to EN until translated).
- A bubble-specific UI affordance (chart, sparkline, tooltip). The textual category list carries the message; visual treatments can be a follow-up.
- Real-time AI capex updates (e.g. ticker hooked to live earnings releases). The static yearly projection is sufficient.

## Implementation skill stack

Per project convention captured in memory (`design_skill_stack.md`):

1. `superpowers:writing-plans` — produce task-by-task implementation plan.
2. `design-taste-frontend` → `emil-design-eng` → `impeccable` — visual polish pass on the rendered tab. Likely surface-area: caption typography, methodology block readability with composite source, category row balance with the new "× the entire ___ program" unit strings (longer than typical).

## Risks

| Risk | Mitigation |
|---|---|
| Cited 2025 actual ($320B) drifts before publish — Q4 2025 earnings season is mid-2026. | Confirm number against most recent earnings releases at data-file authoring; bump `lastUpdated` and re-derive `growthFactor` if needed. |
| `unitCostUsd` for `dotcom-telecom-capex` ($500B) coincides exactly with `totalUsd` ($500B), which renders as "× 1.00 the entire dotcom buildout" — visually flat. | This is the message: a single year of AI capex equalling the entire 5-year dotcom infra boom is the bubble framing. Display formatter already shows `1.0×` cleanly. |
| 4-tab strip may wrap awkwardly on 320px viewports. | Tab strip is `overflow-x-auto scrollbar-none` — overflow scrolls horizontally. Verified pattern. |
| Composite source attribution is weaker than single-body sources used by war/tobacco/fossil-fuels. | Methodology paragraph explicitly names this as a composite. Each category retains ≥1 cited source per schema. |

## Acceptance

- New `ai` tab visible in production (`couldhave.world/en/`).
- All four tabs deep-linkable via `?source=...`.
- Lighthouse 99+/100/100/100 on `/en/?source=ai`.
- Vitest + Playwright e2e green.
- Three-skill visual review pass committed.

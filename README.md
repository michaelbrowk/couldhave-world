# couldhave.world

A multilingual data-journalism landing page that shows global military spending in real time and translates it into ten verifiable humanitarian alternatives.

**Live:** [couldhave.world](https://couldhave.world)

## What it is

A single page that:

- Ticks the **projected global military spend for the current year** (based on SIPRI data) live, in real time
- Shows ten concrete alternatives: cure cancer, eradicate malaria, end world hunger, clean water, schools, child vaccination, eliminate extreme poverty, protect rainforest, transition to renewable energy, fund all UN humanitarian appeals
- Each alternative comes with a comparison bar (a real progress meter for the year), a symbol matrix, and citations to authoritative sources (WHO, UNICEF, World Bank, Gavi, UN OCHA, UNESCO, IRENA, FAO, Lancet, IFPRI)
- Available in **English, Spanish, German, French**
- Fully static, no backend, all data open and auditable in this repo

## Methodology

The counter projects this year's total military spending from the most recent SIPRI actual figures (currently 2024) compounded by the trailing 5-year average growth rate. It ticks against that yearly total based on seconds elapsed since January 1.

Each humanitarian alternative is computed from authoritative sources documented in `data/categories.json`. Each category has a minimum of two source citations with publication years and a methodology statement explaining what the unit cost represents.

All data lives in `data/`:

- `data/military-spending.json` — SIPRI historical totals + projection
- `data/categories.json` — 10 humanitarian alternatives with sources and methodology

Updating the data is a single hand edit followed by a rebuild. SIPRI publishes annually in late April; that's the only refresh cadence the project needs.

## Stack

- **Next.js 16** (App Router) with `output: 'export'` — fully static
- **React 19**, **TypeScript** strict mode
- **Tailwind CSS v4** (CSS-only theme tokens)
- **Framer Motion** — counter spring smoothing, fade-in, comparison bar reveal, symbol matrix stagger
- **next/font** — Instrument Serif (display), Inter (body), JetBrains Mono (numbers), all self-hosted from Google Fonts
- **Built-in dictionary i18n** — `app/[locale]/dictionaries.ts`, no external i18n library
- **Vitest** — 42 unit tests (projection math, formatters, category metrics, data sanity)
- **Playwright** — 12 E2E tests (locales, ticking counter, language switcher, axe a11y across all 4 locales)
- **Biome** — lint + format
- **satori + @resvg/resvg-js** — daily-refreshable Open Graph image generation at build time

## Quality bars

- Lighthouse desktop: **100 / 100 / 100 / 100** on all 4 locales (performance, accessibility, best practices, SEO)
- axe WCAG 2.0 AA: **0 serious or critical violations** on all 4 locales
- All tests green (`npm test && npm run e2e`)

## Local development

```bash
git clone https://github.com/michaelbrowk/couldhave-world.git
cd couldhave-world
npm install
npm run dev
```

Open `http://localhost:3000/en/` (or `/es/`, `/de/`, `/fr/`).

## Build & test

```bash
npm run lint     # Biome
npm test         # Vitest unit tests
npm run e2e      # Playwright end-to-end
npm run build    # Static export to ./out
```

## Updating data

When SIPRI releases its annual fact sheet (late April), edit two values in `data/military-spending.json`:

- `projection.basedOnYear` → the new latest actual year
- `projection.baseAmountUsd` → the new latest actual world total in current USD
- Optionally re-compute `projection.growthFactor` from the updated 5-year window

Add the new year to `historical[]`, run `npm run build`, and the projected total + per-day + per-second rates update everywhere automatically.

## License

[MIT](./LICENSE) — do whatever you want with it. Data sources are credited in `data/categories.json` and on the methodology section of the page.

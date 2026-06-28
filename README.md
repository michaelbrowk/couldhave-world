# couldhave.world

A multilingual data-journalism landing page that shows seven major global spending categories in real time and translates each into verifiable humanitarian alternatives.

**Live:** [couldhave.world](https://couldhave.world)

## What it is

A single page that:

- Ticks the **projected annual spend** for the selected spending category live, in real time
- Offers **7 spending tabs**: AI infrastructure, war, tobacco, fossil fuels, food waste, advertising, gambling — each backed by SIPRI/IPCC/WHO/industry authoritative data
- For each tab, shows **6–10 concrete humanitarian alternatives** — cure cancer, eradicate malaria, end world hunger, clean water, schools, child vaccination, eliminate extreme poverty, protect rainforest, and more — with a comparison bar, a symbol matrix, and citations
- Available in **English, Spanish, German, French**
- Fully static, no backend, all data open and auditable in this repo

## Methodology

The counter projects this year's total spending for the active tab from the most recent authoritative figures, compounded by a trailing average growth rate where applicable. It ticks against the yearly total based on seconds elapsed since January 1.

Each humanitarian alternative is computed from authoritative sources documented in `data/sources/<id>.json`. Each category has a minimum of two source citations with publication years and a methodology statement explaining what the unit cost represents.

All source data lives in `data/sources/`:

- `data/sources/war.json` — SIPRI military spending: historical totals + projection
- `data/sources/tobacco.json` — global tobacco industry revenue
- `data/sources/fossil-fuels.json` — IMF-estimated fossil-fuel subsidy flows
- `data/sources/ai.json` — Big-Five hyperscaler AI/data-centre capex (Epoch AI)
- `data/sources/food-waste.json` — FAO/UNEP global food-loss cost estimate
- `data/sources/advertising.json` — global ad-spend (GroupM/Magna)
- `data/sources/gambling.json` — global gross gaming revenue (H2 Gambling Capital)

Updating a source is a single hand edit to the relevant JSON file followed by a rebuild.

## Stack

- **Next.js 16** (App Router) with `output: 'export'` — fully static
- **React 19**, **TypeScript** strict mode
- **Tailwind CSS v4** (CSS-only theme tokens)
- **Framer Motion** — counter spring smoothing, fade-in, comparison bar reveal, symbol matrix stagger
- **next/font** — Instrument Serif (display), Inter (body), JetBrains Mono (numbers), all self-hosted from Google Fonts
- **Built-in dictionary i18n** — `app/[locale]/dictionaries.ts`, no external i18n library
- **Vitest** — 121 unit tests (projection math, formatters, category metrics, data sanity across all 7 sources)
- **Playwright** — 24 E2E tests (locales, ticking counter, source-tab switching, language switcher, axe a11y across all 4 locales)
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

When SIPRI releases its annual fact sheet (late April), edit the relevant values in `data/sources/war.json`:

- `projection.basedOnYear` → the new latest actual year
- `projection.baseAmountUsd` → the new latest actual world total in current USD
- Optionally re-compute `projection.growthFactor` from the updated 5-year window

Add the new year to `historical[]`, run `npm run build`, and the projected total + per-day + per-second rates update everywhere automatically. The same pattern applies to other sources when their upstream data refreshes.

## Deploy

The site is deployed to a DigitalOcean droplet at `46.101.216.23`, served by nginx as static files (no Node process). Production URL: [couldhave.world](https://couldhave.world).

### Initial deploy

```bash
# Local build
npm run build

# Sync the static export to the droplet
rsync -avz --delete out/ root@46.101.216.23:/opt/couldhave-world/out/
```

The nginx vhost lives at `/etc/nginx/sites-available/couldhave-world` on the droplet, with `root /opt/couldhave-world/out` and `try_files` for the locale routes. SSL is handled by Certbot with auto-renew.

### Updating data

After editing any `data/sources/*.json`, rebuild and rsync:

```bash
npm run build && rsync -avz --delete out/ root@46.101.216.23:/opt/couldhave-world/out/
```

### Daily Open Graph refresh

The `og:image` meta tag points at `/og.png?v=YYYY-MM-DD`. The PNG is regenerated daily by the GitHub Actions workflow `.github/workflows/daily-og-refresh.yml` (cron `5 0 * * *` UTC), which runs only the OG generator script and rsyncs the resulting file. The site itself is not rebuilt — only the single PNG is overwritten on the droplet.

The workflow needs one repo secret:

| Secret | Value |
|---|---|
| `DROPLET_SSH_KEY` | OpenSSH private key whose public half is in `/root/.ssh/authorized_keys` on the droplet |

Set it under **Settings → Secrets and variables → Actions → New repository secret**.

## License

[MIT](./LICENSE) — do whatever you want with it. Data sources are credited in `data/sources/*.json` and on the methodology section of the page.

# couldhave.world

A multilingual data-journalism site comparing seven spending, economic-cost and historical monetary benchmarks with documented programme costs.

**Live:** [couldhave.world](https://couldhave.world)

## Interpretation

The counter distributes a stated annual benchmark evenly over the displayed UTC calendar year. It is not live observed spending. Source notes identify forecasts, estimates, dates, and assumptions. Economic losses and implicit subsidies are not redirectable cash budgets; totals across tabs must not be added.

Comparison quantities divide that illustrated year-to-date amount by an explicit unit cost. Annual funding, multi-year programmes, commodity-only prices and historical costs are labelled separately. Money alone does not guarantee outcomes. Historical dollar figures retain their documented price basis unless an adjustment is explicitly shown. At the end of the reviewed year the counter caps at the stated total and displays a notice; it does not invent a new year's forecast.

## Audited data

All seven datasets live in `data/sources/*.json`. The September 2026 evidence review is recorded in:

- [AI evidence and corrections](docs/audit-ai-2026-09-06.md)
- [Other six sources and comparisons](docs/audit-non-ai-2026-09-06.md)

The site ships 44 supported comparisons after removing 11 unsupported or incompatible ones. Each retained row includes its numerator/denominator context, source link and year, and interpretation limits. Source-detail prose is in English; titles, units and explanatory interface copy are translated into English, Spanish, German and French.

## Stack and validation

Next.js 16 static export, React 19, TypeScript, Tailwind, Framer Motion, Zod, Vitest, Playwright and Biome. There is no production Node server or database; nginx serves the export. Source-schema checks validate positive costs, distinct keys/years, date ordering and compounded projections. Regression tests cover shared denominators, all four dictionaries, mobile units, forecast boundaries and analytics attribution. Browser checks run against the exported production HTML, including hydration, instead of the development server.

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
npm run build    # Static export to ./out
npm run e2e      # Playwright against the export
```

## Updating data

1. Verify the primary source, publication date, period, currency/price basis, geographic coverage and cost scope.
2. Update the relevant JSON and its source notes; do not mark a forecast as an actual. `lastUpdated` is the review date, not the observation year.
3. Update localized summaries if the value, scope or denominator changed. Do not require a minimum number of rows beyond one supported comparison.
4. Run `npm run lint`, `npm test`, `npm run build`, and `npm run e2e`. Browser tests require a fresh export and Playwright Chromium (`npx playwright install chromium`).
5. Commit the reviewed change and deploy the same checked export.

## Deploy and rollback

Build and check locally, then run:

```bash
bash scripts/deploy.sh couldhave-droplet
```

The script uploads a new release under `/opt/couldhave-world/releases`, validates locale HTML, and switches the nginx-served `/opt/couldhave-world/out` link under a deployment lock. Failed HTTPS or served-byte checks automatically restore the prior export while the deployment lock is held. Prior exports remain on disk for rollback. The first migration of the legacy `out` directory preserves it as `out-before-<release>`. Rollback consists of pointing `out` at a verified prior release, then checking all public locale routes. Never delete the last working release during deployment.

The existing daily GitHub Actions workflow rebuilds both static HTML and Open Graph image, then deploys a new release. This refreshes crawler snapshots and the image cache version together. It does not retrieve or refresh the underlying research estimates. The workflow uses the existing `DROPLET_SSH_KEY` repository secret. Pull requests and main pushes run independent quality checks, including the production-export browser tests.

Localhost previews do not send events to the production analytics project. Production explicit events honor Do Not Track; IP-based geolocation enrichment and automatic capture are disabled.

## License

[MIT](./LICENSE). Source datasets retain their original attribution and terms.

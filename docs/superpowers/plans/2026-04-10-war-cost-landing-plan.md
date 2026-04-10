# War Cost Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The full specification lives at `docs/superpowers/specs/2026-04-10-war-cost-landing-design.md` — read it before starting and refer back whenever a task references a spec section.

**Goal:** Build a multilingual data-journalism landing page that shows global military spending in real time and translates it into 10 humanitarian alternatives with verifiable sources.

**Architecture:** Single-page Next.js 15 app (App Router) with static export (`output: 'export'`). All data lives as JSON in the repo — no backend, no API, no database. `next-intl` handles 5 languages via `[locale]` route segment. Framer Motion powers the ticking counter, scroll animations, and the "bars → matrix" transition. Recharts renders a single FT-styled horizontal bar chart. All "illustrations" are inline SVG.

**Tech Stack:** Next.js 15, next-intl, Tailwind CSS, Framer Motion, Recharts, TypeScript (strict), Vitest (unit), Playwright (E2E), Biome (lint/format). Fonts via `next/font`: Instrument Serif, Inter, JetBrains Mono. All Google Fonts, self-hosted.

---

## File Structure Map

This locks in boundaries before tasks start. Each file has one responsibility; files that change together live together.

```
war-cost-landing/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx               # M0 (stub) → M2-M6 (real sections composed here)
│   │   └── layout.tsx             # M0: next-intl provider, fonts, global shell
│   ├── globals.css                # M0: Tailwind imports + design tokens
│   └── favicon.ico                # M0: placeholder
├── i18n/
│   ├── routing.ts                 # M0: next-intl routing config (5 locales)
│   └── request.ts                 # M0: next-intl request config
├── middleware.ts                  # M0: next-intl locale middleware
├── components/
│   ├── hero/
│   │   └── TickingCounter.tsx     # M2: ticking counter with reduced-motion fallback
│   ├── categories/
│   │   ├── CategoryBlock.tsx      # M3: wrapper for one category
│   │   ├── ComparisonBars.tsx     # M3: two FT-style bars with animated reveal
│   │   ├── SymbolMatrix.tsx       # M3: grid of SVG symbols; canvas fallback at N>500
│   │   └── CategorySymbol.tsx     # M3-M4: SVG dispatcher (cross, drop, grain, roof, coin, leaf, ray)
│   ├── visualization/
│   │   └── SpendingByCountry.tsx  # M5: Recharts horizontal bar chart
│   ├── layout/
│   │   ├── LanguageSwitcher.tsx   # M6: 5-language dropdown
│   │   ├── Methodology.tsx        # M6: formulas + sources + last updated
│   │   └── Footer.tsx             # M6: languages, GitHub link, author, year
│   └── common/
│       └── FadeInOnScroll.tsx     # M2: reusable scroll-in-view fade (IntersectionObserver)
├── lib/
│   ├── projection.ts              # M1: ticking counter math (pure, testable)
│   ├── formatters.ts              # M1: Intl.NumberFormat helpers per locale
│   └── categories.ts              # M1: category metric calculation + matrix mode selection
├── data/
│   ├── military-spending.json     # M1: SIPRI-based projection data
│   └── categories.json            # M1: 10 categories with sources
├── messages/
│   ├── en.json                    # M0 stub → M2-M6 real strings
│   ├── ru.json
│   ├── es.json
│   ├── de.json
│   └── fr.json
├── tests/
│   ├── unit/
│   │   ├── projection.test.ts     # M1
│   │   ├── formatters.test.ts     # M1
│   │   └── categories.test.ts     # M1
│   └── e2e/
│       ├── languages.spec.ts      # M7
│       ├── counter.spec.ts        # M7
│       └── categories.spec.ts     # M7
├── next.config.ts                 # M0: static export + next-intl plugin
├── tailwind.config.ts             # M0: font families + design token extension
├── biome.json                     # M0
├── playwright.config.ts           # M0
├── vitest.config.ts               # M0
├── tsconfig.json                  # M0 (from create-next-app)
├── package.json                   # M0
└── README.md                      # M0: how to run
```

---

## Milestone Ordering

Each milestone ends in a visibly working state. Do not start milestone N+1 until N is committed and verified.

- **M0 — Bootstrap:** Next.js scaffold, i18n, fonts, design tokens, test runners. Ends with a "hello" page on all 5 locales.
- **M1 — Data:** `data/*.json` filled with real sourced numbers. Pure utility libraries with unit tests.
- **M2 — Hero:** Ticking counter + hero section, localized.
- **M3 — Category prototype:** One fully working category block (bars + matrix + transition + source footnote) using 2 symbols.
- **M4 — All 10 categories:** Remaining symbols, all 10 blocks rendered from JSON, scale adaptation, canvas fallback.
- **M5 — Country chart:** Recharts top-15 horizontal bar chart.
- **M6 — Methodology + Footer:** Text section, language switcher, footer.
- **M7 — Polish + tests:** E2E suite, Lighthouse, a11y, reduced-motion, skill-based polish passes.
- **M8 — Deploy:** Deferred. User develops locally for now.

---

# Milestone 0 — Bootstrap

**Goal of this milestone:** Running Next.js app on `localhost:3000` with all 5 locales renderable at `/en`, `/ru`, `/es`, `/de`, `/fr`, fonts loaded, design tokens in place, Vitest and Playwright installed and configured.

## Task 0.1: Initialize Next.js in existing directory

**Files:**
- Create: entire Next.js scaffold at the project root
- Preserve: existing `docs/` directory

- [ ] **Step 1: Verify current directory state**

Run: `ls -la /Users/michaelbrowk/Documents/Me/Projects/war-cost-landing/`

Expected: only `docs/` is present (plus `.` and `..`). If anything else exists, stop and ask before continuing.

- [ ] **Step 2: Temporarily move docs aside**

Run:
```bash
cd /Users/michaelbrowk/Documents/Me/Projects/war-cost-landing
mv docs ../war-cost-landing-docs-temp
ls -la
```

Expected: directory is empty.

- [ ] **Step 3: Scaffold Next.js into the empty directory**

Run:
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm \
  --no-eslint
```

When prompted about Turbopack, answer `Yes`. When prompted about any overwrite of existing files (`.gitignore`, etc.), answer `Yes`.

Expected: project scaffolded, `package.json`, `app/`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json` etc. are present.

- [ ] **Step 4: Restore docs**

Run:
```bash
mv ../war-cost-landing-docs-temp docs
ls docs/superpowers/specs/
```

Expected: the spec file is back at `docs/superpowers/specs/2026-04-10-war-cost-landing-design.md`.

- [ ] **Step 5: Initialize git and make first commit**

Run:
```bash
git init
git add .
git commit -m "chore: bootstrap next.js project from spec"
```

Expected: commit succeeds.

---

## Task 0.2: Install dependencies

**Files:** `package.json`

- [ ] **Step 1: Install runtime dependencies**

Run:
```bash
npm install next-intl framer-motion recharts
```

- [ ] **Step 2: Install dev dependencies**

Run:
```bash
npm install --save-dev \
  vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom \
  @playwright/test \
  @biomejs/biome
```

- [ ] **Step 3: Install Playwright browsers**

Run: `npx playwright install chromium`

Expected: chromium downloads.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install next-intl, framer-motion, recharts, test tooling"
```

---

## Task 0.3: Configure Biome

**Files:**
- Create: `biome.json`

- [ ] **Step 1: Write biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error"
      },
      "style": {
        "noNonNullAssertion": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  }
}
```

- [ ] **Step 2: Add npm scripts for biome**

Edit `package.json`, add to `"scripts"`:
```json
"lint": "biome check .",
"lint:fix": "biome check --write ."
```

- [ ] **Step 3: Run formatter on the scaffold**

Run: `npm run lint:fix`

Expected: formatting applied, no errors.

- [ ] **Step 4: Commit**

```bash
git add biome.json package.json
git commit -m "chore: configure biome lint + format"
```

---

## Task 0.4: Configure Next.js for static export and strict TypeScript

**Files:**
- Modify: `next.config.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Edit next.config.ts**

Replace contents with:
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    typedRoutes: true,
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 2: Enable strict TypeScript**

Edit `tsconfig.json`, ensure `compilerOptions` contains:
```json
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true
```

- [ ] **Step 3: Commit**

```bash
git add next.config.ts tsconfig.json
git commit -m "chore: enable static export and strict typescript"
```

---

## Task 0.5: Set up next-intl routing for 5 locales

**Files:**
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Write i18n/routing.ts**

```ts
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "ru", "es", "de", "fr"] as const,
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 2: Write i18n/request.ts**

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Write middleware.ts**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

- [ ] **Step 4: Commit**

```bash
git add i18n middleware.ts
git commit -m "feat(i18n): configure next-intl routing for 5 locales"
```

---

## Task 0.6: Create stub message files

**Files:**
- Create: `messages/en.json`, `messages/ru.json`, `messages/es.json`, `messages/de.json`, `messages/fr.json`

- [ ] **Step 1: Write messages/en.json**

```json
{
  "hello": "Hello"
}
```

- [ ] **Step 2: Write messages/ru.json**

```json
{
  "hello": "Привет"
}
```

- [ ] **Step 3: Write messages/es.json**

```json
{
  "hello": "Hola"
}
```

- [ ] **Step 4: Write messages/de.json**

```json
{
  "hello": "Hallo"
}
```

- [ ] **Step 5: Write messages/fr.json**

```json
{
  "hello": "Bonjour"
}
```

- [ ] **Step 6: Commit**

```bash
git add messages/
git commit -m "feat(i18n): add stub message files for 5 locales"
```

---

## Task 0.7: Replace app/ with locale-aware structure

**Files:**
- Delete: `app/page.tsx` (the create-next-app default)
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx`
- Modify: `app/layout.tsx` → delete (layout moves under `[locale]/`)
- Modify: `app/globals.css` → preserve but simplify

- [ ] **Step 1: Delete default page and root layout**

Run:
```bash
rm app/page.tsx app/layout.tsx
```

- [ ] **Step 2: Create app/[locale]/layout.tsx**

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "War Cost",
  description:
    "What the world spends on war this year — and what could have been done instead.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[--bg] text-[--text-primary] font-sans antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create app/[locale]/page.tsx (stub)**

```tsx
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePageInner />;
}

function HomePageInner() {
  const t = useTranslations();
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="font-serif text-6xl">{t("hello")}</h1>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat(app): locale-aware layout with fonts and next-intl provider"
```

---

## Task 0.8: Set up design tokens in globals.css

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Rewrite app/globals.css**

```css
@import "tailwindcss";

@theme {
  --color-bg: #FAFAF8;
  --color-text-primary: #0A0A0A;
  --color-text-secondary: #6B6B68;
  --color-border: #E5E5E0;
  --color-accent: #B91C1C;

  --font-serif: var(--font-serif), Georgia, serif;
  --font-sans: var(--font-sans), system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;
}

:root {
  --bg: #FAFAF8;
  --text-primary: #0A0A0A;
  --text-secondary: #6B6B68;
  --border-color: #E5E5E0;
  --accent: #B91C1C;
}

html, body {
  background-color: var(--bg);
  color: var(--text-primary);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify tailwind.config.ts references are minimal (Tailwind v4 uses CSS @theme)**

Ensure `tailwind.config.ts` contains only:
```ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
} satisfies Config;
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat(style): add design tokens and reduced-motion reset"
```

---

## Task 0.9: Verify dev server renders all 5 locales

**Files:** none

- [ ] **Step 1: Start dev server**

Run: `npm run dev` (in a separate terminal or background)

Expected: server on `http://localhost:3000`.

- [ ] **Step 2: Manually open all 5 locales in a browser**

Verify:
- `http://localhost:3000/en` → `"Hello"` in Instrument Serif
- `http://localhost:3000/ru` → `"Привет"` in Instrument Serif
- `http://localhost:3000/es` → `"Hola"`
- `http://localhost:3000/de` → `"Hallo"`
- `http://localhost:3000/fr` → `"Bonjour"`
- `http://localhost:3000/` → redirects to `/en/`

- [ ] **Step 3: Run build to make sure static export works**

Run: `npm run build`

Expected: build completes successfully, `out/` directory created with subdirs `out/en`, `out/ru`, `out/es`, `out/de`, `out/fr`.

- [ ] **Step 4: Stop dev server, commit any remaining changes**

```bash
git status
```

If clean, proceed. Otherwise commit.

---

## Task 0.10: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Write vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2: Write tests/setup.ts**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add test scripts to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create a smoke test**

Create `tests/unit/smoke.test.ts`:
```ts
import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("arithmetic still works", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: 1 test passes.

- [ ] **Step 6: Delete the smoke test**

```bash
rm tests/unit/smoke.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts tests/ package.json
git commit -m "chore(test): configure vitest"
```

---

## Task 0.11: Configure Playwright

**Files:**
- Create: `playwright.config.ts`
- Modify: `package.json` (add e2e script)

- [ ] **Step 1: Write playwright.config.ts**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Add e2e scripts to package.json**

Add:
```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui"
```

- [ ] **Step 3: Add Playwright output to .gitignore**

Edit `.gitignore`, append:
```
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts package.json .gitignore
git commit -m "chore(test): configure playwright"
```

---

## Task 0.12: Milestone 0 verification

- [ ] **Step 1: Run the full local check**

Run in sequence:
```bash
npm run lint
npm test
npm run build
```

Expected: all three succeed.

- [ ] **Step 2: Manual browser sanity check**

`npm run dev`, verify `/en`, `/ru`, `/es`, `/de`, `/fr` render. Verify fonts are loaded (view source, check for preloaded font files).

- [ ] **Step 3: Tag milestone**

```bash
git tag m0-bootstrap
```

**M0 done.** Proceed to M1.

---

# Milestone 1 — Data Layer

**Goal of this milestone:** `data/military-spending.json` and `data/categories.json` contain real, sourced numbers. `lib/projection.ts`, `lib/formatters.ts`, `lib/categories.ts` are implemented test-first and 100% covered.

## Task 1.1: Research and write data/military-spending.json

**Files:**
- Create: `data/military-spending.json`
- Create: `data/military-spending.schema.ts` (TypeScript type for the JSON)

- [ ] **Step 1: Research SIPRI data**

Fetch the SIPRI Military Expenditure Database page: https://sipri.org/databases/milex

Also fetch the SIPRI fact sheet for the most recent year available (usually titled "Trends in World Military Expenditure, YYYY", published in April of YYYY+1).

Record:
- Latest available actual year and total global military spending in current USD
- Year-by-year totals for the 5 most recent available years (for growth factor calculation)
- Top 15 countries by military spending for the latest available year

**If the SIPRI 2025 report is not yet public on fetch date**, use the 2024 fact sheet (https://www.sipri.org/publications/2025/sipri-fact-sheets/trends-world-military-expenditure-2024) with `basedOnYear: 2024`.

- [ ] **Step 2: Compute growth factor**

Compute `growthFactor = (latest / latest_minus_5) ** (1/5)`, i.e. the geometric mean of year-over-year growth over the trailing 5-year window. Round to 4 decimal places.

Document the calculation in a comment in `data/military-spending.schema.ts`.

- [ ] **Step 3: Write data/military-spending.schema.ts**

```ts
export type MilitarySpendingData = {
  currentYear: number;
  projection: {
    totalUsd: number;
    basedOnYear: number;
    baseAmountUsd: number;
    growthFactor: number;
    growthBasis: string;
  };
  historical: Array<{
    year: number;
    totalUsd: number;
    actual: boolean;
  }>;
  topCountries: Array<{
    country: string;
    countryCode: string;
    amountUsd: number;
  }>;
  source: string;
  sourceUrl: string;
  lastUpdated: string;
};

import raw from "./military-spending.json";
export const militarySpending: MilitarySpendingData = raw as MilitarySpendingData;
```

- [ ] **Step 4: Write data/military-spending.json**

Fill with real researched values. Example shape (replace numbers with real ones from step 1):

```json
{
  "currentYear": 2026,
  "projection": {
    "totalUsd": 0,
    "basedOnYear": 0,
    "baseAmountUsd": 0,
    "growthFactor": 0,
    "growthBasis": "5-year geometric mean, SIPRI YYYY-YYYY"
  },
  "historical": [],
  "topCountries": [],
  "source": "SIPRI Military Expenditure Database",
  "sourceUrl": "https://sipri.org/databases/milex",
  "lastUpdated": "2026-04-10"
}
```

**No zero placeholder values are allowed to be committed.** Fill in real numbers from your SIPRI research before committing.

- [ ] **Step 5: Commit**

```bash
git add data/
git commit -m "feat(data): add SIPRI-sourced military spending projection data"
```

---

## Task 1.2: Research and write data/categories.json

**Files:**
- Create: `data/categories.json`
- Create: `data/categories.schema.ts`

- [ ] **Step 1: Research each of the 10 categories from spec section 5**

For each of the 10 categories listed in the spec (section 5), find the stated cost unit from authoritative sources. The 10 categories are: `cancer-treatment`, `malaria-eradication`, `world-hunger`, `clean-water`, `schools-lmic`, `child-vaccination`, `extreme-poverty`, `rainforest-protection`, `renewable-transition`, `humanitarian-aid`.

For each category record:
- `id` (exact kebab-case id from above)
- Cost unit type: `perUnit` (cost per single unit like "one cancer treatment"), `totalSolution` (cost to solve the entire problem worldwide), or `annualNeed` (yearly cost to cover the ongoing need)
- Cost in USD
- **Minimum 2 authoritative sources** (WHO, UNICEF, World Bank, Gavi, UN OCHA, UNESCO, Gates Foundation, WFP, IRENA, IEA, WRI, Nature Conservancy, Lancet, etc.)
- Year of the source publication
- Brief methodology statement

Do not invent numbers. If you cannot find a sourced number for a category, stop and ask the user.

- [ ] **Step 2: Write data/categories.schema.ts**

```ts
export type CategorySymbolId =
  | "cross"
  | "drop"
  | "grain"
  | "roof"
  | "coin"
  | "leaf"
  | "ray";

export type CategoryScaleHint = "perUnit" | "totalSolution" | "annualNeed";

export type CategorySource = {
  name: string;
  url: string;
  year: number;
};

export type Category = {
  id: string;
  titleKey: string;
  unitLabelKey: string;
  symbol: CategorySymbolId;
  scaleHint: CategoryScaleHint;
  unitCostUsd: number;
  sources: CategorySource[];
  methodology: string;
};

import raw from "./categories.json";
export const categories: Category[] = raw as Category[];
```

- [ ] **Step 3: Write data/categories.json**

Write all 10 categories as a JSON array. Example shape for one entry:

```json
{
  "id": "cancer-treatment",
  "titleKey": "categories.cancer.title",
  "unitLabelKey": "categories.cancer.unit",
  "symbol": "cross",
  "scaleHint": "perUnit",
  "unitCostUsd": 150000,
  "sources": [
    {
      "name": "WHO Global Cancer Observatory",
      "url": "https://gco.iarc.fr/",
      "year": 2024
    },
    {
      "name": "Lancet Oncology — Global costs of cancer treatment",
      "url": "https://www.thelancet.com/journals/lanonc/",
      "year": 2023
    }
  ],
  "methodology": "Average cost of a full cancer treatment course in middle-income countries per WHO 2024"
}
```

Repeat for all 10 categories. Use real sourced numbers from step 1, not placeholders.

- [ ] **Step 4: Commit**

```bash
git add data/categories.json data/categories.schema.ts
git commit -m "feat(data): add 10 humanitarian alternative categories with sources"
```

---

## Task 1.3: Implement lib/projection.ts (TDD)

**Files:**
- Create: `tests/unit/projection.test.ts`
- Create: `lib/projection.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/projection.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  projectCurrentYearTotal,
  secondsSinceYearStart,
  currentSpendEstimate,
} from "@/lib/projection";

describe("projectCurrentYearTotal", () => {
  it("multiplies base by growth factor", () => {
    expect(projectCurrentYearTotal(1_000_000, 1.05)).toBeCloseTo(1_050_000, 5);
  });

  it("returns base when growth factor is 1", () => {
    expect(projectCurrentYearTotal(2_443_000_000_000, 1)).toBe(2_443_000_000_000);
  });
});

describe("secondsSinceYearStart", () => {
  it("returns 0 at midnight on Jan 1 UTC", () => {
    const d = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
    expect(secondsSinceYearStart(d)).toBe(0);
  });

  it("returns 86400 after one full day", () => {
    const d = new Date(Date.UTC(2026, 0, 2, 0, 0, 0));
    expect(secondsSinceYearStart(d)).toBe(86_400);
  });

  it("returns ~half of year total at mid-year", () => {
    const d = new Date(Date.UTC(2026, 6, 2, 12, 0, 0));
    const halfYear = 182 * 86_400 + 12 * 3600;
    expect(secondsSinceYearStart(d)).toBe(halfYear);
  });
});

describe("currentSpendEstimate", () => {
  const projection = {
    totalUsd: 2_600_000_000_000,
    basedOnYear: 2025,
    baseAmountUsd: 2_443_000_000_000,
    growthFactor: 1.064,
    growthBasis: "test",
  };

  it("returns 0 at exactly Jan 1 midnight UTC", () => {
    const d = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
    expect(currentSpendEstimate(projection, d, 2026)).toBe(0);
  });

  it("returns the full projected total at end of year", () => {
    const d = new Date(Date.UTC(2026, 11, 31, 23, 59, 59));
    const result = currentSpendEstimate(projection, d, 2026);
    expect(result).toBeGreaterThan(projection.totalUsd * 0.999);
    expect(result).toBeLessThanOrEqual(projection.totalUsd);
  });

  it("is linear in time within the year", () => {
    const quarter = new Date(Date.UTC(2026, 3, 2, 12, 0, 0));
    const result = currentSpendEstimate(projection, quarter, 2026);
    const fraction = result / projection.totalUsd;
    expect(fraction).toBeGreaterThan(0.24);
    expect(fraction).toBeLessThan(0.26);
  });

  it("handles leap years correctly (2028 has 366 days)", () => {
    const end = new Date(Date.UTC(2028, 11, 31, 23, 59, 59));
    const result = currentSpendEstimate(projection, end, 2028);
    expect(result).toBeGreaterThan(projection.totalUsd * 0.999);
  });
});
```

- [ ] **Step 2: Run tests (expected to fail)**

Run: `npm test`

Expected: failure — cannot import from `@/lib/projection`.

- [ ] **Step 3: Implement lib/projection.ts**

```ts
export type Projection = {
  totalUsd: number;
  basedOnYear: number;
  baseAmountUsd: number;
  growthFactor: number;
  growthBasis: string;
};

export function projectCurrentYearTotal(
  baseAmountUsd: number,
  growthFactor: number,
): number {
  return baseAmountUsd * growthFactor;
}

export function secondsSinceYearStart(now: Date): number {
  const year = now.getUTCFullYear();
  const yearStart = Date.UTC(year, 0, 1, 0, 0, 0);
  return Math.max(0, Math.floor((now.getTime() - yearStart) / 1000));
}

function secondsInYear(year: number): number {
  const start = Date.UTC(year, 0, 1, 0, 0, 0);
  const end = Date.UTC(year + 1, 0, 1, 0, 0, 0);
  return (end - start) / 1000;
}

export function currentSpendEstimate(
  projection: Projection,
  now: Date,
  currentYear: number,
): number {
  const elapsed = secondsSinceYearStart(now);
  const total = secondsInYear(currentYear);
  const fraction = Math.min(1, elapsed / total);
  return projection.totalUsd * fraction;
}
```

- [ ] **Step 4: Run tests (expected to pass)**

Run: `npm test`

Expected: all projection tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/projection.ts tests/unit/projection.test.ts
git commit -m "feat(lib): add projection math for ticking counter"
```

---

## Task 1.4: Implement lib/formatters.ts (TDD)

**Files:**
- Create: `tests/unit/formatters.test.ts`
- Create: `lib/formatters.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/formatters.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatCurrency, formatCount, formatCompact } from "@/lib/formatters";

describe("formatCurrency", () => {
  it("formats USD in English with dollar sign and commas", () => {
    const result = formatCurrency(2_600_000_000_000, "en");
    expect(result).toContain("$");
    expect(result).toMatch(/2[,.]600[,.]000[,.]000[,.]000/);
  });

  it("formats in Russian with narrow no-break space", () => {
    const result = formatCurrency(2_600_000_000_000, "ru");
    expect(result).toMatch(/2\s600\s000\s000\s000/);
  });

  it("formats in German with dot thousands", () => {
    const result = formatCurrency(2_600_000_000_000, "de");
    expect(result).toMatch(/2\.600\.000\.000\.000/);
  });
});

describe("formatCount", () => {
  it("rounds counts over 1M to nearest million", () => {
    expect(formatCount(16_543_210, "en")).toMatch(/17[,.]000[,.]000|16[,.]000[,.]000/);
  });

  it("rounds counts 10k-1M to nearest 10k", () => {
    expect(formatCount(543_210, "en")).toMatch(/540[,.]000|550[,.]000/);
  });

  it("keeps counts under 10k as integers", () => {
    expect(formatCount(4321, "en")).toMatch(/4[,.]321/);
  });
});

describe("formatCompact", () => {
  it("renders 2.6 trillion as $2.6T in English", () => {
    const result = formatCompact(2_600_000_000_000, "en");
    expect(result).toMatch(/\$2\.6\s*T/i);
  });
});
```

- [ ] **Step 2: Run tests (expected to fail)**

Run: `npm test -- formatters`

Expected: FAIL.

- [ ] **Step 3: Implement lib/formatters.ts**

```ts
export type SupportedLocale = "en" | "ru" | "es" | "de" | "fr";

export function formatCurrency(amount: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCount(count: number, locale: SupportedLocale): string {
  let rounded: number;
  if (count >= 1_000_000) {
    rounded = Math.round(count / 1_000_000) * 1_000_000;
  } else if (count >= 10_000) {
    rounded = Math.round(count / 10_000) * 10_000;
  } else {
    rounded = Math.round(count);
  }
  return new Intl.NumberFormat(locale).format(rounded);
}

export function formatCompact(amount: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
  }).format(amount);
}
```

- [ ] **Step 4: Run tests (expected to pass)**

Run: `npm test -- formatters`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/formatters.ts tests/unit/formatters.test.ts
git commit -m "feat(lib): add locale-aware number formatters"
```

---

## Task 1.5: Implement lib/categories.ts (TDD)

**Files:**
- Create: `tests/unit/categories.test.ts`
- Create: `lib/categories.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/categories.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  computeCategoryMetric,
  pickMatrixMode,
  computeSymbolCount,
} from "@/lib/categories";
import type { Category } from "@/data/categories.schema";

const cancerCategory: Category = {
  id: "cancer-treatment",
  titleKey: "categories.cancer.title",
  unitLabelKey: "categories.cancer.unit",
  symbol: "cross",
  scaleHint: "perUnit",
  unitCostUsd: 150_000,
  sources: [],
  methodology: "",
};

const malariaCategory: Category = {
  id: "malaria-eradication",
  titleKey: "categories.malaria.title",
  unitLabelKey: "categories.malaria.unit",
  symbol: "drop",
  scaleHint: "totalSolution",
  unitCostUsd: 90_000_000_000,
  sources: [],
  methodology: "",
};

describe("computeCategoryMetric", () => {
  it("divides military total by perUnit cost", () => {
    const result = computeCategoryMetric(cancerCategory, 2_600_000_000_000);
    expect(result).toBeCloseTo(17_333_333, -2);
  });

  it("divides military total by totalSolution cost", () => {
    const result = computeCategoryMetric(malariaCategory, 2_600_000_000_000);
    expect(result).toBeCloseTo(28.888, 1);
  });
});

describe("pickMatrixMode", () => {
  it("returns 'discrete' when value < 40", () => {
    expect(pickMatrixMode(28)).toBe("discrete");
  });

  it("returns 'dense' when value >= 40", () => {
    expect(pickMatrixMode(17_333_333)).toBe("dense");
  });
});

describe("computeSymbolCount", () => {
  it("returns the exact value in discrete mode", () => {
    expect(computeSymbolCount(28, "discrete")).toBe(28);
  });

  it("caps dense mode at 500 visible symbols", () => {
    const { visibleCount, unitsPerSymbol } = computeSymbolCount(17_333_333, "dense");
    expect(visibleCount).toBeLessThanOrEqual(500);
    expect(visibleCount).toBeGreaterThan(100);
    expect(unitsPerSymbol * visibleCount).toBeCloseTo(17_333_333, -4);
  });
});
```

- [ ] **Step 2: Run tests (expected to fail)**

Run: `npm test -- categories`

Expected: FAIL.

- [ ] **Step 3: Implement lib/categories.ts**

```ts
import type { Category } from "@/data/categories.schema";

export type MatrixMode = "discrete" | "dense";

export type SymbolCountResult =
  | { mode: "discrete"; visibleCount: number; unitsPerSymbol: 1 }
  | { mode: "dense"; visibleCount: number; unitsPerSymbol: number };

export function computeCategoryMetric(
  category: Category,
  militaryTotalUsd: number,
): number {
  if (category.unitCostUsd <= 0) {
    throw new Error(`Invalid unitCostUsd for category ${category.id}`);
  }
  return militaryTotalUsd / category.unitCostUsd;
}

export function pickMatrixMode(metricValue: number): MatrixMode {
  return metricValue < 40 ? "discrete" : "dense";
}

const DENSE_TARGET = 200;
const DENSE_MAX = 500;

export function computeSymbolCount(
  metricValue: number,
  mode: MatrixMode,
): SymbolCountResult {
  if (mode === "discrete") {
    return {
      mode: "discrete",
      visibleCount: Math.round(metricValue),
      unitsPerSymbol: 1,
    };
  }
  const rawUnitsPerSymbol = metricValue / DENSE_TARGET;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawUnitsPerSymbol)));
  const unitsPerSymbol = Math.ceil(rawUnitsPerSymbol / magnitude) * magnitude;
  let visibleCount = Math.round(metricValue / unitsPerSymbol);
  if (visibleCount > DENSE_MAX) {
    const scale = Math.ceil(visibleCount / DENSE_MAX);
    return {
      mode: "dense",
      visibleCount: Math.round(metricValue / (unitsPerSymbol * scale)),
      unitsPerSymbol: unitsPerSymbol * scale,
    };
  }
  return { mode: "dense", visibleCount, unitsPerSymbol };
}
```

- [ ] **Step 4: Run tests (expected to pass)**

Run: `npm test`

Expected: all tests (projection + formatters + categories) pass.

- [ ] **Step 5: Commit**

```bash
git add lib/categories.ts tests/unit/categories.test.ts
git commit -m "feat(lib): add category metric + matrix mode selection"
```

---

## Task 1.6: Milestone 1 verification

- [ ] **Step 1: Run full check**

```bash
npm run lint && npm test && npm run build
```

Expected: all pass.

- [ ] **Step 2: Tag milestone**

```bash
git tag m1-data
```

**M1 done.** Proceed to M2.

---

# Milestone 2 — Hero + Ticking Counter

**Goal:** `/[locale]` renders the hero section with a live ticking counter using real data. All 5 locales show the correct translated caption and methodology footnote. `prefers-reduced-motion` works.

## Task 2.1: Add hero strings to message files

**Files:**
- Modify: `messages/{en,ru,es,de,fr}.json`

- [ ] **Step 1: Define the message keys**

Add the following keys to each message file. Translations below.

**en.json** — merge with existing:
```json
{
  "hello": "Hello",
  "hero": {
    "caption": "Spent on war since January 1, {year}",
    "methodology": "Projected {year}, based on SIPRI {basedOnYear} actuals and 5-year average growth. Actual figures are published annually in April.",
    "scrollHint": "Scroll"
  }
}
```

**ru.json:**
```json
{
  "hello": "Привет",
  "hero": {
    "caption": "Потрачено на войну с 1 января {year} года",
    "methodology": "Проекция на {year} год на основе фактических данных SIPRI за {basedOnYear} и среднего темпа роста за 5 лет. Фактические цифры публикуются ежегодно в апреле.",
    "scrollHint": "Скролл"
  }
}
```

**es.json:**
```json
{
  "hello": "Hola",
  "hero": {
    "caption": "Gastado en guerra desde el 1 de enero de {year}",
    "methodology": "Proyección para {year}, basada en datos reales de SIPRI de {basedOnYear} y el crecimiento promedio de 5 años. Las cifras reales se publican anualmente en abril.",
    "scrollHint": "Desplazar"
  }
}
```

**de.json:**
```json
{
  "hello": "Hallo",
  "hero": {
    "caption": "Seit 1. Januar {year} für Kriege ausgegeben",
    "methodology": "Prognose für {year}, basierend auf SIPRI-Istdaten von {basedOnYear} und dem 5-Jahres-Durchschnittswachstum. Die tatsächlichen Zahlen werden jährlich im April veröffentlicht.",
    "scrollHint": "Scrollen"
  }
}
```

**fr.json:**
```json
{
  "hello": "Bonjour",
  "hero": {
    "caption": "Dépensé pour la guerre depuis le 1er janvier {year}",
    "methodology": "Projection pour {year}, basée sur les données réelles de SIPRI pour {basedOnYear} et la croissance moyenne sur 5 ans. Les chiffres réels sont publiés chaque année en avril.",
    "scrollHint": "Défiler"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add messages/
git commit -m "feat(i18n): add hero section strings for all locales"
```

---

## Task 2.2: Implement FadeInOnScroll helper

**Files:**
- Create: `components/common/FadeInOnScroll.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function FadeInOnScroll({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/common/FadeInOnScroll.tsx
git commit -m "feat(common): add FadeInOnScroll helper"
```

---

## Task 2.3: Implement TickingCounter component

**Files:**
- Create: `components/hero/TickingCounter.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { currentSpendEstimate, type Projection } from "@/lib/projection";
import { formatCurrency, type SupportedLocale } from "@/lib/formatters";

type Props = {
  projection: Projection;
  currentYear: number;
  locale: SupportedLocale;
};

export function TickingCounter({ projection, currentYear, locale }: Props) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState<number>(() =>
    currentSpendEstimate(projection, new Date(), currentYear),
  );

  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const tick = () => {
      setValue(currentSpendEstimate(projection, new Date(), currentYear));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [projection, currentYear, reduceMotion]);

  const formatted = formatCurrency(value, locale);

  return (
    <div
      className="font-serif text-[--accent] leading-none tabular-nums"
      style={{ fontSize: "clamp(80px, 15vw, 240px)" }}
      role="status"
      aria-live="off"
      aria-label={formatCurrency(projection.totalUsd, locale)}
    >
      {formatted}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hero/TickingCounter.tsx
git commit -m "feat(hero): add TickingCounter with reduced-motion fallback"
```

---

## Task 2.4: Compose hero into app/[locale]/page.tsx

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

```tsx
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { TickingCounter } from "@/components/hero/TickingCounter";
import { FadeInOnScroll } from "@/components/common/FadeInOnScroll";
import { militarySpending } from "@/data/military-spending.schema";
import type { SupportedLocale } from "@/lib/formatters";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePageInner locale={locale as SupportedLocale} />;
}

function HomePageInner({ locale }: { locale: SupportedLocale }) {
  const t = useTranslations("hero");
  const { currentYear, projection } = militarySpending;

  return (
    <main className="min-h-screen">
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8">
        <TickingCounter
          projection={projection}
          currentYear={currentYear}
          locale={locale}
        />
        <FadeInOnScroll delay={0.3}>
          <p className="font-serif text-2xl md:text-4xl max-w-3xl">
            {t("caption", { year: currentYear })}
          </p>
        </FadeInOnScroll>
        <FadeInOnScroll delay={0.6}>
          <p className="font-sans text-sm text-[--text-secondary] max-w-md">
            {t("methodology", {
              year: currentYear,
              basedOnYear: projection.basedOnYear,
            })}
          </p>
        </FadeInOnScroll>
        <FadeInOnScroll delay={1.0}>
          <div
            className="font-sans text-xs text-[--text-secondary] uppercase tracking-widest mt-12"
            aria-hidden="true"
          >
            {t("scrollHint")} ↓
          </div>
        </FadeInOnScroll>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run dev server and verify visually**

```bash
npm run dev
```

Open `/en`, verify: counter ticks, caption renders with year, methodology text is secondary color, scroll hint visible.

Check `/ru`, `/es`, `/de`, `/fr` — all translate correctly with interpolated year.

- [ ] **Step 3: Verify prefers-reduced-motion**

In Chrome DevTools, Rendering → "Emulate CSS prefers-reduced-motion: reduce". Reload `/en`. Expected: counter shows a static value, no ticking, no fade-in animations.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat(hero): compose hero section with counter and methodology"
```

---

## Task 2.5: Milestone 2 verification

- [ ] **Step 1: Run full check**

```bash
npm run lint && npm test && npm run build
```

- [ ] **Step 2: Tag**

```bash
git tag m2-hero
```

**M2 done.** Proceed to M3.

---

# Milestone 3 — Category Prototype

**Goal:** One category block fully working end-to-end: title, big number, unit, ComparisonBars with animated reveal, SymbolMatrix with stagger animation, source footnote. Uses 2 symbols (`cross`, `drop`). Proves the entire visual system.

## Task 3.1: Add category prototype message keys

**Files:**
- Modify: `messages/{en,ru,es,de,fr}.json`

- [ ] **Step 1: Add category keys to each locale**

**en.json** — merge:
```json
{
  "transition": {
    "headline": "Instead, this money could have..."
  },
  "categories": {
    "military": "Military spending {year}",
    "cancer": {
      "title": "Cured cancer worldwide",
      "unit": "people cured"
    },
    "malaria": {
      "title": "Eradicated malaria",
      "unit": "times over"
    },
    "sourceLabel": "Source",
    "sourcesToggle": "See sources"
  }
}
```

Repeat with translations for each locale (`ru`, `es`, `de`, `fr`). Translate the strings naturally.

Reference translations:
- **ru:** `"headline": "Вместо этого можно было..."`, `"military": "Военные расходы {year}"`, `"cancer.title": "Вылечить от рака"`, `"cancer.unit": "человек излечено"`, `"malaria.title": "Полностью ликвидировать малярию"`, `"malaria.unit": "раз подряд"`, `"sourceLabel": "Источник"`, `"sourcesToggle": "Показать источники"`
- **es:** `"headline": "En su lugar, este dinero podría haber..."`, `"military": "Gasto militar {year}"`, `"cancer.title": "Curado el cáncer en todo el mundo"`, `"cancer.unit": "personas curadas"`, `"malaria.title": "Erradicada la malaria"`, `"malaria.unit": "veces"`, `"sourceLabel": "Fuente"`, `"sourcesToggle": "Ver fuentes"`
- **de:** `"headline": "Stattdessen hätte dieses Geld..."`, `"military": "Militärausgaben {year}"`, `"cancer.title": "Krebs weltweit geheilt"`, `"cancer.unit": "Menschen geheilt"`, `"malaria.title": "Malaria ausgerottet"`, `"malaria.unit": "mal"`, `"sourceLabel": "Quelle"`, `"sourcesToggle": "Quellen anzeigen"`
- **fr:** `"headline": "À la place, cet argent aurait pu..."`, `"military": "Dépenses militaires {year}"`, `"cancer.title": "Guérir le cancer dans le monde"`, `"cancer.unit": "personnes guéries"`, `"malaria.title": "Éradiquer le paludisme"`, `"malaria.unit": "fois"`, `"sourceLabel": "Source"`, `"sourcesToggle": "Voir les sources"`

- [ ] **Step 2: Commit**

```bash
git add messages/
git commit -m "feat(i18n): add category prototype strings for 5 locales"
```

---

## Task 3.2: Implement CategorySymbol (cross and drop)

**Files:**
- Create: `components/categories/CategorySymbol.tsx`

- [ ] **Step 1: Write the dispatcher**

```tsx
import type { CategorySymbolId } from "@/data/categories.schema";

type Props = {
  symbol: CategorySymbolId;
  size?: number;
  className?: string;
};

export function CategorySymbol({ symbol, size = 12, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (symbol) {
    case "cross":
      return (
        <svg {...common}>
          <path d="M12 4v16M4 12h16" />
        </svg>
      );
    case "drop":
      return (
        <svg {...common}>
          <path d="M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12z" />
        </svg>
      );
    case "grain":
      return (
        <svg {...common}>
          <path d="M12 3v18M8 7c0 2 2 3 4 3M8 11c0 2 2 3 4 3M8 15c0 2 2 3 4 3M16 7c0 2-2 3-4 3M16 11c0 2-2 3-4 3M16 15c0 2-2 3-4 3" />
        </svg>
      );
    case "roof":
      return (
        <svg {...common}>
          <path d="M3 12l9-7 9 7M5 10v10h14V10" />
        </svg>
      );
    case "coin":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M4 20c0-8 6-14 16-16-2 10-8 16-16 16zM4 20l10-10" />
        </svg>
      );
    case "ray":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
        </svg>
      );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add components/categories/CategorySymbol.tsx
git commit -m "feat(categories): add CategorySymbol SVG dispatcher"
```

---

## Task 3.3: Implement ComparisonBars

**Files:**
- Create: `components/categories/ComparisonBars.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { formatCompact, type SupportedLocale } from "@/lib/formatters";

type Props = {
  militaryLabel: string;
  militaryAmount: number;
  alternativeLabel: string;
  alternativeAmount: number;
  locale: SupportedLocale;
};

export function ComparisonBars({
  militaryLabel,
  militaryAmount,
  alternativeLabel,
  alternativeAmount,
  locale,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();

  const max = Math.max(militaryAmount, alternativeAmount);
  const militaryPct = (militaryAmount / max) * 100;
  const altPct = (alternativeAmount / max) * 100;

  const animate = (pct: number) =>
    reduceMotion || !inView ? { width: 0 } : { width: `${pct}%` };
  const militaryTarget = reduceMotion ? `${militaryPct}%` : undefined;
  const altTarget = reduceMotion ? `${altPct}%` : undefined;

  return (
    <div ref={ref} className="space-y-6 w-full max-w-5xl">
      <Row
        label={militaryLabel}
        amount={formatCompact(militaryAmount, locale)}
        pct={militaryPct}
        color="var(--accent)"
        animate={animate(militaryPct)}
        staticWidth={militaryTarget}
      />
      <Row
        label={alternativeLabel}
        amount={formatCompact(alternativeAmount, locale)}
        pct={altPct}
        color="var(--text-primary)"
        animate={animate(altPct)}
        staticWidth={altTarget}
        delay={0.6}
      />
    </div>
  );
}

function Row({
  label,
  amount,
  color,
  animate,
  staticWidth,
  delay = 0,
}: {
  label: string;
  amount: string;
  pct: number;
  color: string;
  animate: { width: string | number };
  staticWidth?: string;
  delay?: number;
}) {
  return (
    <div>
      <div className="flex justify-between font-mono text-xs text-[--text-secondary] uppercase tracking-wider mb-2">
        <span>{label}</span>
        <span>{amount}</span>
      </div>
      <div className="h-2 bg-[--border-color] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            width: staticWidth,
          }}
          initial={{ width: 0 }}
          animate={animate}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/categories/ComparisonBars.tsx
git commit -m "feat(categories): add ComparisonBars with animated reveal"
```

---

## Task 3.4: Implement SymbolMatrix

**Files:**
- Create: `components/categories/SymbolMatrix.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { CategorySymbol } from "./CategorySymbol";
import type { CategorySymbolId } from "@/data/categories.schema";
import type { SymbolCountResult } from "@/lib/categories";

type Props = {
  symbol: CategorySymbolId;
  count: SymbolCountResult;
  tooltipLabel: string;
};

const STAGGER = 0.012;
const DENSE_DELAY_AFTER_BARS = 0.3;

export function SymbolMatrix({ symbol, count, tooltipLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduceMotion = useReducedMotion();

  const { visibleCount, unitsPerSymbol, mode } = count;
  const items = Array.from({ length: visibleCount });

  const cellSize = mode === "discrete" ? 40 : 16;
  const gap = mode === "discrete" ? 8 : 4;

  return (
    <div
      ref={ref}
      className="flex flex-wrap justify-center max-w-5xl mx-auto"
      style={{ gap }}
      role="img"
      aria-label={`${visibleCount} symbols, each representing ${unitsPerSymbol} ${tooltipLabel}`}
    >
      {items.map((_, i) => {
        const delay = reduceMotion ? 0 : DENSE_DELAY_AFTER_BARS + i * STAGGER;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              reduceMotion || inView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.6 }
            }
            transition={{
              duration: 0.3,
              delay,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ width: cellSize, height: cellSize }}
            className="text-[--text-primary]"
          >
            <CategorySymbol symbol={symbol} size={cellSize} />
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/categories/SymbolMatrix.tsx
git commit -m "feat(categories): add SymbolMatrix with staggered reveal"
```

---

## Task 3.5: Implement CategoryBlock wrapper

**Files:**
- Create: `components/categories/CategoryBlock.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useTranslations } from "next-intl";
import type { Category } from "@/data/categories.schema";
import {
  computeCategoryMetric,
  pickMatrixMode,
  computeSymbolCount,
} from "@/lib/categories";
import { formatCount, type SupportedLocale } from "@/lib/formatters";
import { ComparisonBars } from "./ComparisonBars";
import { SymbolMatrix } from "./SymbolMatrix";
import { FadeInOnScroll } from "@/components/common/FadeInOnScroll";

type Props = {
  category: Category;
  militaryTotalUsd: number;
  currentYear: number;
  locale: SupportedLocale;
};

export function CategoryBlock({
  category,
  militaryTotalUsd,
  currentYear,
  locale,
}: Props) {
  const t = useTranslations("categories");
  const metric = computeCategoryMetric(category, militaryTotalUsd);
  const mode = pickMatrixMode(metric);
  const symbolCount = computeSymbolCount(metric, mode);

  const displayNumber =
    mode === "discrete"
      ? formatCount(Math.round(metric), locale)
      : formatCount(metric, locale);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 gap-12 text-center">
      <FadeInOnScroll>
        <h2
          className="font-serif leading-none"
          style={{ fontSize: "clamp(48px, 8vw, 120px)" }}
        >
          {t(`${category.id.replace(/-/g, "")}.title` as never, {
            defaultValue: t(`${simpleKey(category.id)}.title` as never),
          })}
        </h2>
      </FadeInOnScroll>
      <FadeInOnScroll delay={0.2}>
        <div
          className="font-serif leading-none text-[--accent]"
          style={{ fontSize: "clamp(64px, 10vw, 160px)" }}
        >
          {displayNumber}
        </div>
      </FadeInOnScroll>
      <FadeInOnScroll delay={0.4}>
        <p className="font-sans text-lg text-[--text-secondary] uppercase tracking-widest">
          {t(`${simpleKey(category.id)}.unit` as never)}
        </p>
      </FadeInOnScroll>
      <FadeInOnScroll delay={0.6}>
        <ComparisonBars
          militaryLabel={t("military", { year: currentYear })}
          militaryAmount={militaryTotalUsd}
          alternativeLabel={
            mode === "discrete"
              ? t(`${simpleKey(category.id)}.title` as never)
              : t(`${simpleKey(category.id)}.title` as never)
          }
          alternativeAmount={
            category.scaleHint === "perUnit"
              ? category.unitCostUsd * Math.round(metric)
              : category.unitCostUsd
          }
          locale={locale}
        />
      </FadeInOnScroll>
      <SymbolMatrix
        symbol={category.symbol}
        count={symbolCount}
        tooltipLabel={t(`${simpleKey(category.id)}.unit` as never)}
      />
      <SourceFootnote category={category} />
    </section>
  );
}

function simpleKey(id: string): string {
  // "cancer-treatment" → "cancer", "malaria-eradication" → "malaria"
  // The translation keys use a short form matching spec section 5 conventions.
  const map: Record<string, string> = {
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
  };
  return map[id] ?? id;
}

function SourceFootnote({ category }: { category: Category }) {
  const t = useTranslations("categories");
  return (
    <details className="font-mono text-xs text-[--text-secondary] max-w-md">
      <summary className="cursor-pointer">{t("sourcesToggle")}</summary>
      <ul className="mt-2 space-y-1 list-none">
        {category.sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[--accent]"
            >
              {s.name} ({s.year})
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 italic">{category.methodology}</p>
    </details>
  );
}
```

**Important:** The translation key name `.title` / `.unit` is based on `simpleKey(category.id)`. This must match the keys added in Task 3.1. Task 4.2 will extend `simpleKey` when the remaining 8 categories are added.

- [ ] **Step 2: Commit**

```bash
git add components/categories/CategoryBlock.tsx
git commit -m "feat(categories): add CategoryBlock wrapper composing bars and matrix"
```

---

## Task 3.6: Compose transition and one category into page

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Extend the page**

Replace `HomePageInner` body to append transition + one category. The prototype uses the first category from `data/categories.json` (after M1 research, this is `cancer-treatment`).

```tsx
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { TickingCounter } from "@/components/hero/TickingCounter";
import { FadeInOnScroll } from "@/components/common/FadeInOnScroll";
import { CategoryBlock } from "@/components/categories/CategoryBlock";
import { militarySpending } from "@/data/military-spending.schema";
import { categories } from "@/data/categories.schema";
import type { SupportedLocale } from "@/lib/formatters";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePageInner locale={locale as SupportedLocale} />;
}

function HomePageInner({ locale }: { locale: SupportedLocale }) {
  const t = useTranslations();
  const { currentYear, projection } = militarySpending;
  const prototype = categories[0]; // M3: one category for prototype
  if (!prototype) throw new Error("No categories defined");

  return (
    <main>
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8">
        <TickingCounter
          projection={projection}
          currentYear={currentYear}
          locale={locale}
        />
        <FadeInOnScroll delay={0.3}>
          <p className="font-serif text-2xl md:text-4xl max-w-3xl">
            {t("hero.caption", { year: currentYear })}
          </p>
        </FadeInOnScroll>
        <FadeInOnScroll delay={0.6}>
          <p className="font-sans text-sm text-[--text-secondary] max-w-md">
            {t("hero.methodology", {
              year: currentYear,
              basedOnYear: projection.basedOnYear,
            })}
          </p>
        </FadeInOnScroll>
        <FadeInOnScroll delay={1.0}>
          <div
            className="font-sans text-xs text-[--text-secondary] uppercase tracking-widest mt-12"
            aria-hidden="true"
          >
            {t("hero.scrollHint")} ↓
          </div>
        </FadeInOnScroll>
      </section>

      <section className="min-h-[50vh] flex items-center justify-center px-6">
        <FadeInOnScroll>
          <h2
            className="font-serif leading-tight text-center max-w-4xl"
            style={{ fontSize: "clamp(40px, 6vw, 96px)" }}
          >
            {t("transition.headline")}
          </h2>
        </FadeInOnScroll>
      </section>

      <CategoryBlock
        category={prototype}
        militaryTotalUsd={projection.totalUsd}
        currentYear={currentYear}
        locale={locale}
      />
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Check `/en`:
- Hero with ticking counter
- Scroll → transition headline fades in
- Scroll → category block: title "Cured cancer worldwide", big number, unit, comparison bars (red tiny vs black huge), matrix of crosses appears

Check `/ru`, `/es`, `/de`, `/fr` — all translated.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat(page): compose transition and prototype category"
```

---

## Task 3.7: Milestone 3 verification

- [ ] **Step 1: Full check**

```bash
npm run lint && npm test && npm run build
```

- [ ] **Step 2: Tag**

```bash
git tag m3-prototype
```

**M3 done.** Proceed to M4.

---

# Milestone 4 — All 10 Categories

**Goal:** All 10 categories render correctly from `data/categories.json`, each with the right symbol. Scale adaptation works (discrete vs dense matrix). Canvas fallback for `visibleCount > 500`.

## Task 4.1: Add remaining 8 category translation keys

**Files:**
- Modify: `messages/{en,ru,es,de,fr}.json`

- [ ] **Step 1: Extend each message file with the missing 8 categories**

Under `"categories"`, add keys for `hunger`, `water`, `schools`, `vaccination`, `poverty`, `rainforest`, `renewable`, `humanitarian`. Each has `title` and `unit`.

**en.json — extend `categories`:**
```json
"hunger": { "title": "Ended world hunger", "unit": "years covered" },
"water": { "title": "Clean water for everyone", "unit": "times over" },
"schools": { "title": "Built schools in low-income countries", "unit": "new school places" },
"vaccination": { "title": "Vaccinated every child on Earth", "unit": "annual campaigns" },
"poverty": { "title": "Eliminated extreme poverty", "unit": "years eliminated" },
"rainforest": { "title": "Protected rainforests", "unit": "hectares protected" },
"renewable": { "title": "Transitioned to renewable energy", "unit": "percent of global transition" },
"humanitarian": { "title": "Covered all humanitarian crises", "unit": "times over" }
```

**ru.json — translations:**
```json
"hunger": { "title": "Покончить с мировым голодом", "unit": "лет покрыто" },
"water": { "title": "Дать чистую воду всем", "unit": "раз подряд" },
"schools": { "title": "Построить школы в бедных странах", "unit": "новых мест" },
"vaccination": { "title": "Привить каждого ребёнка на Земле", "unit": "ежегодных кампаний" },
"poverty": { "title": "Победить крайнюю бедность", "unit": "лет без бедности" },
"rainforest": { "title": "Защитить тропические леса", "unit": "гектаров защищено" },
"renewable": { "title": "Перейти на возобновляемую энергию", "unit": "процентов перехода" },
"humanitarian": { "title": "Покрыть все гуманитарные кризисы", "unit": "раз подряд" }
```

**es.json:**
```json
"hunger": { "title": "Acabar con el hambre mundial", "unit": "años cubiertos" },
"water": { "title": "Agua potable para todos", "unit": "veces" },
"schools": { "title": "Construir escuelas en países pobres", "unit": "nuevas plazas" },
"vaccination": { "title": "Vacunar a todos los niños del mundo", "unit": "campañas anuales" },
"poverty": { "title": "Eliminar la pobreza extrema", "unit": "años eliminada" },
"rainforest": { "title": "Proteger los bosques tropicales", "unit": "hectáreas protegidas" },
"renewable": { "title": "Transición a energías renovables", "unit": "por ciento de la transición" },
"humanitarian": { "title": "Cubrir todas las crisis humanitarias", "unit": "veces" }
```

**de.json:**
```json
"hunger": { "title": "Welthunger beendet", "unit": "Jahre abgedeckt" },
"water": { "title": "Sauberes Wasser für alle", "unit": "mal" },
"schools": { "title": "Schulen in armen Ländern gebaut", "unit": "neue Schulplätze" },
"vaccination": { "title": "Jedes Kind der Welt geimpft", "unit": "Jahreskampagnen" },
"poverty": { "title": "Extreme Armut beseitigt", "unit": "Jahre beseitigt" },
"rainforest": { "title": "Regenwälder geschützt", "unit": "Hektar geschützt" },
"renewable": { "title": "Umstellung auf erneuerbare Energien", "unit": "Prozent des Übergangs" },
"humanitarian": { "title": "Alle humanitären Krisen abgedeckt", "unit": "mal" }
```

**fr.json:**
```json
"hunger": { "title": "Mettre fin à la faim dans le monde", "unit": "années couvertes" },
"water": { "title": "Eau potable pour tous", "unit": "fois" },
"schools": { "title": "Construire des écoles dans les pays pauvres", "unit": "nouvelles places" },
"vaccination": { "title": "Vacciner chaque enfant sur Terre", "unit": "campagnes annuelles" },
"poverty": { "title": "Éliminer l'extrême pauvreté", "unit": "années éliminées" },
"rainforest": { "title": "Protéger les forêts tropicales", "unit": "hectares protégés" },
"renewable": { "title": "Transition vers les énergies renouvelables", "unit": "pour cent de la transition" },
"humanitarian": { "title": "Couvrir toutes les crises humanitaires", "unit": "fois" }
```

- [ ] **Step 2: Commit**

```bash
git add messages/
git commit -m "feat(i18n): add remaining 8 category strings for 5 locales"
```

---

## Task 4.2: Render all 10 category blocks

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Replace single category with `.map` over all 10**

In `HomePageInner`, replace:
```tsx
const prototype = categories[0];
if (!prototype) throw new Error("No categories defined");
```
with nothing, and replace the `<CategoryBlock>` call with:

```tsx
{categories.map((category) => (
  <CategoryBlock
    key={category.id}
    category={category}
    militaryTotalUsd={projection.totalUsd}
    currentYear={currentYear}
    locale={locale}
  />
))}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Scroll through `/en`. Expected: 10 category blocks in order. Each with correct symbol, title, number, unit. Verify at least one `discrete` mode (e.g., malaria "27 times") and one `dense` mode (e.g., cancer "17M people") render correctly.

- [ ] **Step 3: Check all locales**

Cycle through `/ru`, `/es`, `/de`, `/fr` — all 10 titles translated.

- [ ] **Step 4: Run build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat(page): render all 10 categories"
```

---

## Task 4.3: Canvas fallback for dense matrices over 500 symbols

**Files:**
- Modify: `components/categories/SymbolMatrix.tsx`
- Create: `components/categories/SymbolMatrixCanvas.tsx`

**Why:** After matrix sizing logic from `computeSymbolCount`, `visibleCount` is capped at 500. But if the research in M1 produces category data where cap kicks in, we want a verified performant path. This task ensures canvas fallback exists even if not currently triggered.

- [ ] **Step 1: Write canvas variant**

Create `components/categories/SymbolMatrixCanvas.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { CategorySymbolId } from "@/data/categories.schema";

type Props = {
  symbol: CategorySymbolId;
  visibleCount: number;
  tooltipLabel: string;
};

const CELL = 14;
const GAP = 3;

export function SymbolMatrixCanvas({ symbol, visibleCount, tooltipLabel }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cols = Math.floor(canvas.width / (CELL + GAP));
    const rows = Math.ceil(visibleCount / cols);
    canvas.height = rows * (CELL + GAP);

    ctx.strokeStyle = "#0A0A0A";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < visibleCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * (CELL + GAP);
      const y = row * (CELL + GAP);
      drawSymbol(ctx, symbol, x, y, CELL);
    }
  }, [symbol, visibleCount]);

  return (
    <canvas
      ref={ref}
      className="w-full max-w-5xl mx-auto"
      width={1000}
      height={400}
      role="img"
      aria-label={`${visibleCount} symbols representing ${tooltipLabel}`}
    />
  );
}

function drawSymbol(
  ctx: CanvasRenderingContext2D,
  symbol: CategorySymbolId,
  x: number,
  y: number,
  size: number,
) {
  ctx.beginPath();
  const cx = x + size / 2;
  const cy = y + size / 2;
  switch (symbol) {
    case "cross":
      ctx.moveTo(cx, y + 2);
      ctx.lineTo(cx, y + size - 2);
      ctx.moveTo(x + 2, cy);
      ctx.lineTo(x + size - 2, cy);
      break;
    case "drop":
      ctx.moveTo(cx, y + 2);
      ctx.quadraticCurveTo(x + size - 2, cy, cx, y + size - 2);
      ctx.quadraticCurveTo(x + 2, cy, cx, y + 2);
      break;
    case "coin":
      ctx.arc(cx, cy, size / 2 - 2, 0, Math.PI * 2);
      break;
    default:
      // fallback: small square
      ctx.rect(x + 2, y + 2, size - 4, size - 4);
  }
  ctx.stroke();
}
```

- [ ] **Step 2: Add threshold in SymbolMatrix.tsx**

Modify `SymbolMatrix.tsx` to delegate to canvas variant when `visibleCount > 500`:

Add at the top of the component after destructuring:
```tsx
if (visibleCount > 500) {
  return (
    <SymbolMatrixCanvas
      symbol={symbol}
      visibleCount={visibleCount}
      tooltipLabel={tooltipLabel}
    />
  );
}
```

And add the import:
```tsx
import { SymbolMatrixCanvas } from "./SymbolMatrixCanvas";
```

- [ ] **Step 3: Commit**

```bash
git add components/categories/
git commit -m "feat(categories): add canvas fallback for dense matrices over 500"
```

---

## Task 4.4: Milestone 4 verification

- [ ] **Step 1: Full check**

```bash
npm run lint && npm test && npm run build
```

- [ ] **Step 2: Visual check all 10 categories in browser on all 5 locales**

- [ ] **Step 3: Tag**

```bash
git tag m4-all-categories
```

**M4 done.** Proceed to M5.

---

# Milestone 5 — Country Chart

**Goal:** Single horizontal bar chart showing top 15 countries by military spending, FT-styled, with scroll-triggered growth animation.

## Task 5.1: Add chart translation keys

**Files:**
- Modify: `messages/{en,ru,es,de,fr}.json`

- [ ] **Step 1: Add chart keys**

**en.json:**
```json
"chart": {
  "title": "Top 15 countries by military spending, {year}",
  "caption": "Source: SIPRI Military Expenditure Database"
}
```

Translations:
- **ru:** `"title": "Топ-15 стран по военным расходам, {year}", "caption": "Источник: База данных SIPRI"`
- **es:** `"title": "Los 15 principales países por gasto militar, {year}", "caption": "Fuente: Base de datos de SIPRI"`
- **de:** `"title": "Top 15 Länder nach Militärausgaben, {year}", "caption": "Quelle: SIPRI-Datenbank"`
- **fr:** `"title": "Top 15 des pays par dépenses militaires, {year}", "caption": "Source : Base de données SIPRI"`

- [ ] **Step 2: Commit**

```bash
git add messages/
git commit -m "feat(i18n): add chart section strings"
```

---

## Task 5.2: Implement SpendingByCountry

**Files:**
- Create: `components/visualization/SpendingByCountry.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCompact, type SupportedLocale } from "@/lib/formatters";
import { militarySpending } from "@/data/military-spending.schema";

type Props = {
  locale: SupportedLocale;
};

export function SpendingByCountry({ locale }: Props) {
  const t = useTranslations("chart");
  const { topCountries, projection } = militarySpending;
  const data = topCountries
    .slice(0, 15)
    .map((c) => ({ country: c.country, amount: c.amountUsd, code: c.countryCode }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 gap-8 max-w-6xl mx-auto">
      <h2
        className="font-serif leading-tight text-center"
        style={{ fontSize: "clamp(32px, 5vw, 64px)" }}
      >
        {t("title", { year: projection.basedOnYear })}
      </h2>
      <div className="w-full h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 60, left: 40, bottom: 20 }}
          >
            <XAxis
              type="number"
              tickFormatter={(v) => formatCompact(v as number, locale)}
              stroke="var(--text-secondary)"
              fontFamily="var(--font-mono)"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="country"
              type="category"
              width={120}
              stroke="var(--text-primary)"
              fontFamily="var(--font-sans)"
              fontSize={14}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border-color)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              formatter={(value: number) => formatCompact(value, locale)}
            />
            <Bar dataKey="amount" radius={[0, 2, 2, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? "var(--accent)" : "var(--text-primary)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="font-mono text-xs text-[--text-secondary] uppercase tracking-wider">
        {t("caption")}
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Add section to page.tsx**

In `app/[locale]/page.tsx`, after the `.map` over categories, add:
```tsx
<SpendingByCountry locale={locale} />
```

and import:
```tsx
import { SpendingByCountry } from "@/components/visualization/SpendingByCountry";
```

- [ ] **Step 3: Verify in browser**

Expected: bar chart appears after category list, top country (USA) in red accent, others in black, values formatted per locale.

- [ ] **Step 4: Run build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/visualization/ app/[locale]/page.tsx
git commit -m "feat(viz): add top-15 countries military spending bar chart"
```

---

## Task 5.3: Milestone 5 verification

- [ ] **Step 1: Full check**

```bash
npm run lint && npm test && npm run build
```

- [ ] **Step 2: Tag**

```bash
git tag m5-chart
```

**M5 done.** Proceed to M6.

---

# Milestone 6 — Methodology + Footer

**Goal:** Methodology text section with all formulas and sources, working language switcher, footer with attribution.

## Task 6.1: Add methodology + footer translation keys

**Files:**
- Modify: `messages/{en,ru,es,de,fr}.json`

- [ ] **Step 1: Add keys**

**en.json:**
```json
"methodology": {
  "title": "Methodology",
  "counter": "The counter projects the current year's total military spending based on the most recent actual SIPRI data multiplied by the 5-year geometric mean growth rate. It ticks in real time as a fraction of that yearly total based on seconds elapsed since January 1st.",
  "categories": "Each category's alternative number comes from authoritative sources (WHO, UNICEF, World Bank, Gavi, UN OCHA, UNESCO, IRENA). The cost unit and sources for each category are listed in that category's 'See sources' panel.",
  "updated": "Last updated: {date}",
  "repoLabel": "Open data and source code"
},
"footer": {
  "author": "Built as an anti-war statement",
  "year": "{year}"
}
```

Translations:
- **ru:**
```json
"methodology": {
  "title": "Методология",
  "counter": "Счётчик проецирует суммарные военные расходы за текущий год на основе самых свежих фактических данных SIPRI, умноженных на средний геометрический темп роста за 5 лет. Он тикает в реальном времени как доля от годового итога, пропорционально секундам, прошедшим с 1 января.",
  "categories": "Число в каждой категории рассчитано из авторитетных источников (ВОЗ, UNICEF, Всемирный банк, Gavi, UN OCHA, UNESCO, IRENA). Стоимость единицы и источники указаны в панели «Показать источники» каждой категории.",
  "updated": "Обновлено: {date}",
  "repoLabel": "Открытые данные и исходники"
},
"footer": {
  "author": "Создано как антивоенное заявление",
  "year": "{year}"
}
```
- **es:**
```json
"methodology": {
  "title": "Metodología",
  "counter": "El contador proyecta el gasto militar total del año actual en base a los datos reales más recientes de SIPRI multiplicados por la tasa de crecimiento geométrica media de 5 años. Funciona en tiempo real como fracción del total anual según los segundos transcurridos desde el 1 de enero.",
  "categories": "El número alternativo de cada categoría proviene de fuentes autorizadas (OMS, UNICEF, Banco Mundial, Gavi, UN OCHA, UNESCO, IRENA). El costo unitario y las fuentes están en el panel «Ver fuentes» de cada categoría.",
  "updated": "Actualizado: {date}",
  "repoLabel": "Datos y código abiertos"
},
"footer": {
  "author": "Creado como declaración contra la guerra",
  "year": "{year}"
}
```
- **de:**
```json
"methodology": {
  "title": "Methodik",
  "counter": "Der Zähler prognostiziert die gesamten Militärausgaben des aktuellen Jahres auf Basis der neuesten tatsächlichen SIPRI-Daten, multipliziert mit der geometrischen 5-Jahres-Durchschnittswachstumsrate. Er tickt in Echtzeit als Anteil des Jahrestotals basierend auf den seit 1. Januar vergangenen Sekunden.",
  "categories": "Die Alternativzahl jeder Kategorie stammt aus autoritativen Quellen (WHO, UNICEF, Weltbank, Gavi, UN OCHA, UNESCO, IRENA). Kosteneinheit und Quellen sind im Panel „Quellen anzeigen\" jeder Kategorie aufgeführt.",
  "updated": "Zuletzt aktualisiert: {date}",
  "repoLabel": "Offene Daten und Quellcode"
},
"footer": {
  "author": "Erstellt als Anti-Kriegs-Statement",
  "year": "{year}"
}
```
- **fr:**
```json
"methodology": {
  "title": "Méthodologie",
  "counter": "Le compteur projette les dépenses militaires totales de l'année en cours sur la base des données réelles les plus récentes de SIPRI multipliées par le taux de croissance géométrique moyen sur 5 ans. Il tourne en temps réel comme une fraction du total annuel selon les secondes écoulées depuis le 1er janvier.",
  "categories": "Le chiffre alternatif de chaque catégorie provient de sources faisant autorité (OMS, UNICEF, Banque mondiale, Gavi, UN OCHA, UNESCO, IRENA). Le coût unitaire et les sources sont indiqués dans le panneau « Voir les sources » de chaque catégorie.",
  "updated": "Dernière mise à jour : {date}",
  "repoLabel": "Données et code ouverts"
},
"footer": {
  "author": "Créé comme déclaration anti-guerre",
  "year": "{year}"
}
```

- [ ] **Step 2: Commit**

```bash
git add messages/
git commit -m "feat(i18n): add methodology and footer strings"
```

---

## Task 6.2: Implement Methodology component

**Files:**
- Create: `components/layout/Methodology.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useTranslations } from "next-intl";
import { militarySpending } from "@/data/military-spending.schema";

export function Methodology() {
  const t = useTranslations("methodology");
  const { lastUpdated } = militarySpending;

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 max-w-3xl mx-auto gap-8">
      <h2
        className="font-serif leading-tight text-center"
        style={{ fontSize: "clamp(32px, 5vw, 64px)" }}
      >
        {t("title")}
      </h2>
      <div className="font-sans text-base text-[--text-primary] space-y-4 leading-relaxed">
        <p>{t("counter")}</p>
        <p>{t("categories")}</p>
      </div>
      <p className="font-mono text-xs text-[--text-secondary] uppercase tracking-wider">
        {t("updated", { date: lastUpdated })}
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Methodology.tsx
git commit -m "feat(layout): add Methodology section"
```

---

## Task 6.3: Implement LanguageSwitcher

**Files:**
- Create: `components/layout/LanguageSwitcher.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { usePathname, useRouter, routing } from "@/i18n/routing";
import { useLocale } from "next-intl";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ru: "RU",
  es: "ES",
  de: "DE",
  fr: "FR",
};

export function LanguageSwitcher() {
  const current = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav aria-label="Language" className="flex gap-3 font-mono text-xs uppercase">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`transition-colors ${
            loc === current
              ? "text-[--text-primary]"
              : "text-[--text-secondary] hover:text-[--accent]"
          }`}
          aria-current={loc === current ? "page" : undefined}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/LanguageSwitcher.tsx
git commit -m "feat(layout): add LanguageSwitcher"
```

---

## Task 6.4: Implement Footer

**Files:**
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getUTCFullYear();

  return (
    <footer className="px-6 py-16 border-t border-[--border-color] flex flex-col items-center gap-6">
      <LanguageSwitcher />
      <p className="font-sans text-sm text-[--text-secondary] text-center max-w-md">
        {t("author")}
      </p>
      <p className="font-mono text-xs text-[--text-secondary]">{year}</p>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat(layout): add Footer"
```

---

## Task 6.5: Compose Methodology + Footer into page

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Append components**

After `<SpendingByCountry locale={locale} />`, add:
```tsx
<Methodology />
<Footer />
```

and imports:
```tsx
import { Methodology } from "@/components/layout/Methodology";
import { Footer } from "@/components/layout/Footer";
```

- [ ] **Step 2: Visual check in browser**

Scroll to the bottom of `/en`. Expected: methodology text, footer with language switcher, author line, year. Click a language button — URL changes, page updates in the new language, scroll preserved.

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat(page): add methodology and footer sections"
```

---

## Task 6.6: Milestone 6 verification

- [ ] **Step 1: Full check**

```bash
npm run lint && npm test && npm run build
```

- [ ] **Step 2: Tag**

```bash
git tag m6-methodology-footer
```

**M6 done.** Proceed to M7.

---

# Milestone 7 — Polish & Tests

**Goal:** E2E tests pass for all 5 locales. Lighthouse 100/100/100/100 on production build. WCAG AA verified. `prefers-reduced-motion` verified across all animations. Three skill passes (`emil-design-eng`, `design-taste-frontend`, `impeccable`) applied.

## Task 7.1: E2E — languages render

**Files:**
- Create: `tests/e2e/languages.spec.ts`

- [ ] **Step 1: Write the test**

```ts
import { test, expect } from "@playwright/test";

const locales = [
  { code: "en", hello: /Cured cancer|Cure cancer/i },
  { code: "ru", hello: /Вылечить от рака/i },
  { code: "es", hello: /cáncer/i },
  { code: "de", hello: /Krebs/i },
  { code: "fr", hello: /cancer/i },
] as const;

for (const l of locales) {
  test(`${l.code}: homepage renders hero and at least one category`, async ({
    page,
  }) => {
    await page.goto(`/${l.code}`);
    await expect(page).toHaveURL(new RegExp(`/${l.code}/?$`));
    // hero counter is a status element
    await expect(page.getByRole("status")).toBeVisible();
    // scroll to reveal the first category
    await page.mouse.wheel(0, 3000);
    await expect(page.getByText(l.hello).first()).toBeVisible({ timeout: 10_000 });
  });
}
```

- [ ] **Step 2: Run it**

```bash
npm run e2e
```

Expected: 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/languages.spec.ts
git commit -m "test(e2e): verify all 5 locales render hero and first category"
```

---

## Task 7.2: E2E — counter ticks

**Files:**
- Create: `tests/e2e/counter.spec.ts`

- [ ] **Step 1: Write the test**

```ts
import { test, expect } from "@playwright/test";

test("counter value increases over time", async ({ page }) => {
  await page.goto("/en");
  const counter = page.getByRole("status");
  await expect(counter).toBeVisible();

  const first = await counter.textContent();
  await page.waitForTimeout(2000);
  const second = await counter.textContent();

  expect(first).toBeTruthy();
  expect(second).toBeTruthy();
  expect(first).not.toBe(second);
});

test("counter is static with prefers-reduced-motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/en");
  const counter = page.getByRole("status");
  const first = await counter.textContent();
  await page.waitForTimeout(1500);
  const second = await counter.textContent();
  expect(first).toBe(second);
  await ctx.close();
});
```

- [ ] **Step 2: Run it**

```bash
npm run e2e -- counter
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/counter.spec.ts
git commit -m "test(e2e): verify counter ticks and respects reduced motion"
```

---

## Task 7.3: E2E — language switcher

**Files:**
- Create: `tests/e2e/language-switcher.spec.ts`

- [ ] **Step 1: Write the test**

```ts
import { test, expect } from "@playwright/test";

test("language switcher navigates between locales", async ({ page }) => {
  await page.goto("/en");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "RU" }).click();
  await expect(page).toHaveURL(/\/ru/);
  await page.getByRole("button", { name: "DE" }).click();
  await expect(page).toHaveURL(/\/de/);
});
```

- [ ] **Step 2: Run and commit**

```bash
npm run e2e
git add tests/e2e/language-switcher.spec.ts
git commit -m "test(e2e): verify language switcher navigation"
```

---

## Task 7.4: Lighthouse audit

**Files:** none (record findings in a commit message or temporary note)

- [ ] **Step 1: Build and serve**

```bash
npm run build
npx serve out -l 5000 &
```

- [ ] **Step 2: Run Lighthouse via Chrome DevTools or CLI**

```bash
npx lighthouse http://localhost:5000/en --view --preset=desktop --only-categories=performance,accessibility,best-practices,seo
```

Expected: scores 100/100/100/100. If any category is below 100, fix the issue before continuing. Common fixes:
- Missing `<html lang>` — already set per locale in layout, verify.
- Missing meta description — add via `generateMetadata`.
- Contrast — verify tokens against WCAG tool.
- Unused JS — check bundle, dynamic-import Recharts if needed.

- [ ] **Step 3: Stop server**

```bash
kill %1
```

- [ ] **Step 4: Commit any fixes**

```bash
git add .
git commit -m "perf: fix Lighthouse findings to reach 100/100/100/100"
```

(Skip commit if there were no fixes.)

---

## Task 7.5: Accessibility audit with axe

**Files:** none

- [ ] **Step 1: Install axe-core temporarily**

```bash
npm install --save-dev @axe-core/playwright
```

- [ ] **Step 2: Create axe test**

Create `tests/e2e/a11y.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["en", "ru", "es", "de", "fr"] as const) {
  test(`${locale}: no serious a11y violations`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious).toEqual([]);
  });
}
```

- [ ] **Step 3: Run it**

```bash
npm run e2e -- a11y
```

Expected: PASS on all 5 locales. Fix any serious/critical violations.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/a11y.spec.ts package.json package-lock.json
git commit -m "test(e2e): add axe a11y audit for all locales"
```

---

## Task 7.6: Skill polish passes

**Files:** variable (whichever the skills suggest modifying)

- [ ] **Step 1: Run design-taste-frontend pass**

Invoke `design-taste-frontend` skill on the rendered pages. Apply its recommendations on layout rhythm, spacing, typography hierarchy. Focus on macro decisions.

- [ ] **Step 2: Run emil-design-eng pass**

Invoke `emil-design-eng` skill. Apply its recommendations on micro-interactions, animation timings, hover states, the "bars → matrix" transition feel. Focus on detail craftsmanship.

- [ ] **Step 3: Run impeccable pass**

Invoke `impeccable` skill for final polish — edge cases, state completeness, robustness, the parts that make the site feel done.

- [ ] **Step 4: After each skill pass**

```bash
npm run lint && npm test && npm run build && npm run e2e
```

Only move to the next pass if all checks pass.

- [ ] **Step 5: Commit each pass separately**

```bash
git commit -m "polish(design-taste): apply layout and typography refinements"
git commit -m "polish(emil): refine micro-animations and transitions"
git commit -m "polish(impeccable): final state and edge-case polish"
```

---

## Task 7.7: Milestone 7 verification

- [ ] **Step 1: Full check**

```bash
npm run lint && npm test && npm run build && npm run e2e
```

All pass.

- [ ] **Step 2: Tag**

```bash
git tag m7-polish
```

**M7 done.** M8 (deploy) is deferred — user develops locally for now. The landing page is release-ready.

---

# Milestone 8 — Deploy (DEFERRED)

Deferred per user's decision. When ready to deploy:
1. Choose between Digital Ocean App Platform (simpler, ~$0-5/month) or Droplet + nginx (cheaper, ~$4/month, more control). See spec section 13.3.
2. Create a new plan document `docs/superpowers/plans/2026-XX-XX-war-cost-landing-deploy.md` with deploy-specific tasks.

---

# Self-Review Checklist

Run through this after the plan is complete. Issues found are fixed inline.

### Spec coverage

| Spec section | Covered by |
|---|---|
| §1 Concept | M2-M6 collectively (hero + categories + chart + methodology + footer) |
| §2 Principles | Enforced throughout (YAGNI in M8 defer, honesty in M1 data research) |
| §3.1 Hero counter | M2 Tasks 2.3-2.4 |
| §3.2 Transition block | M3 Task 3.6 |
| §3.3 Category blocks | M3 Tasks 3.2-3.6, M4 Tasks 4.1-4.3 |
| §3.4 Country chart | M5 Task 5.2 |
| §3.5 Methodology | M6 Task 6.2 |
| §3.6 Footer | M6 Tasks 6.3-6.4 |
| §4 Data (SIPRI + projection) | M1 Task 1.1, lib M1 Task 1.3 |
| §5 10 categories | M1 Task 1.2 (data), M3-M4 (rendering) |
| §6 Tech stack | M0 (all tooling set up) |
| §7 File structure | M0-M6 (every file in the map has an assigned task) |
| §8.2 Palette tokens | M0 Task 0.8 |
| §8.3 Typography | M0 Task 0.7 (fonts) + usage throughout |
| §8.5 Animations | M2 (FadeInOnScroll, counter), M3 (bars/matrix) |
| §9 Localization 5 langs | M0 Task 0.6 + string additions per milestone |
| §10 Performance | M7 Task 7.4 (Lighthouse) |
| §11 Accessibility | M7 Task 7.5 (axe), reduced-motion in M2/M3 |
| §12 Testing | M1 unit tests, M7 E2E suite |
| §13 Deploy | M8 deferred |
| §14 Milestones | 1:1 match |
| §15 YAGNI | Enforced (no dark mode, no analytics, no CMS, etc.) |
| §16 Claude Code kickoff | This plan itself is the answer |

All spec sections covered.

### Placeholder scan

- No "TBD" in plan.
- No "implement later" / "fill in details" / "similar to Task N" without repeat.
- Every code step contains complete code.
- Every command is concrete with expected output.
- M1 research tasks require real numbers (zero placeholders would block the commit).

### Type consistency

- `Projection` type: defined in `lib/projection.ts`, consumed in `TickingCounter.tsx`, `categories.ts`. Consistent.
- `Category` type: defined in `data/categories.schema.ts`, consumed in `lib/categories.ts`, `CategoryBlock.tsx`. Consistent.
- `SupportedLocale`: defined in `lib/formatters.ts`, threaded through `TickingCounter`, `ComparisonBars`, `CategoryBlock`, `SpendingByCountry`. Consistent.
- `CategorySymbolId`: defined in `data/categories.schema.ts`, used in `CategorySymbol.tsx`, `SymbolMatrix.tsx`, `SymbolMatrixCanvas.tsx`. Consistent.
- `SymbolCountResult` / `MatrixMode`: defined in `lib/categories.ts`, consumed in `CategoryBlock.tsx`, `SymbolMatrix.tsx`. Consistent.
- Translation keys: `simpleKey()` map in Task 3.5 covers all 10 categories added in Tasks 3.1 and 4.1. Consistent.

No type drift found.

---

# Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-10-war-cost-landing-plan.md`.

Recommended next step: open Claude Code inside `war-cost-landing/` and point it at the spec + plan.

Suggested first message for that session:

> Привет. Контекст этого проекта — два документа:
> - Спецификация: `docs/superpowers/specs/2026-04-10-war-cost-landing-design.md`
> - План реализации: `docs/superpowers/plans/2026-04-10-war-cost-landing-plan.md`
>
> Прочитай их целиком. Потом используй skill `superpowers:subagent-driven-development` и начинай исполнение плана с Task 0.1. Останавливайся после каждого milestone для моего ревью.

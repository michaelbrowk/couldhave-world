/**
 * Build-time Open Graph image generator.
 *
 * Reads the projected military spending data, computes the live current
 * spend at the moment of execution, renders a 1200×630 PNG via satori
 * (JSX → SVG) + @resvg/resvg-js (SVG → PNG), and writes it to public/og.png.
 *
 * Hooked into the build via the `prebuild` npm script. A daily rebuild
 * (e.g., GitHub Actions cron) regenerates the image with the day's value.
 * The og:image URL on the site carries a `?v=YYYY-MM-DD` cache-buster so
 * social-media scrapers refetch the new asset.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { militarySpending } from "../data/military-spending.schema";
import { formatCompact, formatCurrency } from "../lib/formatters";
import { currentSpendEstimate } from "../lib/projection";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Fonts ────────────────────────────────────────────────────────────────────
// satori needs raw font bytes (TTF, OTF, or WOFF v1). The @fontsource packages
// ship .woff files for every weight which satori accepts directly.
const inter400 = fs.readFileSync(
  path.join(ROOT, "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"),
);
const inter700 = fs.readFileSync(
  path.join(ROOT, "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"),
);
const instrumentSerif = fs.readFileSync(
  path.join(
    ROOT,
    "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff",
  ),
);

// ── Compute live values ──────────────────────────────────────────────────────
const { projection, currentYear } = militarySpending;
const now = new Date();
const currentSpend = currentSpendEstimate(projection, now, currentYear);
const formatted = formatCurrency(Math.round(currentSpend), "en");

const secondsInYear = (Date.UTC(currentYear + 1, 0, 1) - Date.UTC(currentYear, 0, 1)) / 1000;
const perSecondUsd = projection.totalUsd / secondsInYear;
const perDayUsd = perSecondUsd * 86_400;
const perDayDisplay = formatCompact(perDayUsd, "en");
const perSecondDisplay = formatCurrency(Math.round(perSecondUsd), "en");
const rateLine = `${perDayDisplay} PER DAY  ·  ${perSecondDisplay} PER SECOND`;

const captionLine = `Spent on war since January 1, ${currentYear}`;
const methodologyLine = `Projected ${currentYear}, based on SIPRI ${projection.basedOnYear} actuals and a 5-year average growth rate. Actual figures are published annually in late April.`;

// ── Render ───────────────────────────────────────────────────────────────────

const BG = "#FAFAF8";
const TEXT_PRIMARY = "#0A0A0A";
const TEXT_SECONDARY = "#6B6B68";
const ACCENT = "#B91C1C";
const BORDER = "#E5E5E0";

async function main() {
  const svg = await satori(
    <div
      style={{
        width: 1200,
        height: 630,
        background: BG,
        display: "flex",
        flexDirection: "column",
        padding: "80px 80px 64px",
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          fontSize: 34,
          color: TEXT_PRIMARY,
          fontFamily: "Instrument Serif",
        }}
      >
        {captionLine}
      </div>
      <div
        style={{
          fontSize: 132,
          color: ACCENT,
          fontFamily: "Instrument Serif",
          lineHeight: 1,
          marginTop: 8,
          letterSpacing: "-0.015em",
        }}
      >
        {formatted}
      </div>
      <div
        style={{
          fontSize: 17,
          color: TEXT_SECONDARY,
          fontFamily: "Inter",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          marginTop: 24,
        }}
      >
        {rateLine}
      </div>
      <div
        style={{
          fontSize: 18,
          color: TEXT_SECONDARY,
          marginTop: 28,
          maxWidth: 900,
          lineHeight: 1.55,
        }}
      >
        {methodologyLine}
      </div>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: `1px solid ${BORDER}`,
          paddingTop: 24,
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: TEXT_PRIMARY,
            fontFamily: "Instrument Serif",
          }}
        >
          Instead, this money could have…
        </div>
        <div
          style={{
            fontSize: 16,
            color: TEXT_SECONDARY,
            fontFamily: "Inter",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
        >
          couldhave.world
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: inter400, weight: 400, style: "normal" },
        { name: "Inter", data: inter700, weight: 700, style: "normal" },
        { name: "Instrument Serif", data: instrumentSerif, weight: 400, style: "normal" },
      ],
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const pngData = resvg.render().asPng();

  const publicDir = path.join(ROOT, "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const outputPath = path.join(publicDir, "og.png");
  fs.writeFileSync(outputPath, pngData);

  console.log(
    `✓ Generated ${path.relative(ROOT, outputPath)} (${(pngData.length / 1024).toFixed(1)} KB)`,
  );
  console.log(`  Current spend: ${formatted}`);
  console.log(`  Rate:          ${rateLine}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

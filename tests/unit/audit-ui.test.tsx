import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryRow } from "@/components/categories/CategoryRow";
import { ComparisonBars } from "@/components/categories/ComparisonBars";
import { TickingCounter } from "@/components/hero/TickingCounter";
import { LanguageSwitcherView } from "@/components/layout/LanguageSwitcher";
import { SourceHero } from "@/components/sources/SourceHero";
import type { Category, Source } from "@/data/sources.schema";
import { formatCurrency } from "@/lib/formatters";
import { currentSpendEstimate, isProjectionPeriodComplete } from "@/lib/projection";

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, useReducedMotion: () => true, useInView: () => true };
});

const category: Category = {
  id: "example",
  titleKey: "example.title",
  unitLabelKey: "example.unit",
  symbol: "coin",
  scaleHint: "annualNeed",
  unitCostUsd: 100,
  sources: [{ name: "Underlying estimate", url: "https://example.org/cost", year: 2025 }],
  methodology: "One year of the referenced programme costs USD 100.",
};
const source: Source = {
  id: "ai",
  labelKey: "sources.ai.label",
  currentYear: 2026,
  projection: {
    totalUsd: 1_000_000,
    basedOnYear: 2025,
    baseAmountUsd: 1_000_000,
    growthBasis: "A historical baseline held constant, not an observed live total.",
  },
  source: "Original numerator estimate",
  sourceUrl: "https://example.org/original-estimate",
  lastUpdated: "2026-09-06",
  categories: [category],
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("audited data presentation", () => {
  it("exposes the displayed year-to-date figure to assistive technology", () => {
    vi.useFakeTimers();
    const now = new Date("2026-07-01T12:00:00Z");
    vi.setSystemTime(now);
    render(<TickingCounter projection={source.projection} currentYear={2026} locale="en" />);
    const expected = formatCurrency(currentSpendEstimate(source.projection, now, 2026), "en");
    expect(screen.getByRole("status")).toHaveAccessibleName(expected);
    expect(screen.getByRole("status")).toHaveTextContent(expected);
    expect(expected).not.toBe(formatCurrency(source.projection.totalUsd, "en"));
  });

  it("provides a direct numerator citation and its actual update date", () => {
    render(
      <SourceHero
        source={source}
        locale="en"
        strings={{
          caption: "Estimated spending since January 1, 2026",
          rate: "{perDay} per day · {perSecond} per second",
          methodology: "Illustrative annual estimate.",
          sourcesToggle: "See sources",
          updatedTemplate: "Last updated: {date}",
          counterPeriodEnded: "The {year} estimate is complete.",
        }}
      />,
    );
    const citation = screen.getByText(source.source).closest("a");
    expect(citation).toHaveAttribute("href", source.sourceUrl);
    expect(screen.getByText(source.projection.growthBasis)).toHaveAttribute("lang", "en");
    expect(screen.getByText("Last updated: September 6, 2026")).toHaveAttribute(
      "datetime",
      source.lastUpdated,
    );
  });

  it("labels a completed estimate instead of continuing to claim a live rate", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z"));
    render(
      <SourceHero
        source={source}
        locale="en"
        strings={{
          caption: "Estimated spending since January 1, 2026",
          rate: "{perDay} per day · {perSecond} per second",
          methodology: "Illustrative annual estimate.",
          sourcesToggle: "See sources",
          updatedTemplate: "Last updated: {date}",
          counterPeriodEnded: "The {year} estimate is complete.",
        }}
      />,
    );
    expect(screen.getByText("The 2026 estimate is complete.")).toBeInTheDocument();
    expect(screen.queryByText(/per second/)).not.toBeInTheDocument();
  });

  it("keeps tiny comparison costs proportional instead of inflating them to 0.4%", () => {
    const { container } = render(
      <ComparisonBars
        projection={source.projection}
        currentSpend={500_000}
        militaryLabel="Estimated spending"
        alternativeLabel="One year of a programme"
        alternativeAmount={100}
        alternativeDisplay="$100"
        locale="en"
      />,
    );
    const fills = container.querySelectorAll<HTMLElement>("div[style*='background-color']");
    expect(fills).toHaveLength(2);
    expect(fills[0]?.style.width).toBe("50%");
    expect(fills[1]?.style.width).toBe("0.01%");
  });

  it("retains category units on mobile and explains pictogram scale", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-01T12:00:00Z"));
    const { container } = render(
      <CategoryRow
        category={category}
        projection={source.projection}
        currentYear={2026}
        locale="en"
        strings={{
          title: "Funded a programme",
          unit: "programme-years",
          militaryBarLabel: "Estimated spending",
          alternativeBarLabel: "One programme-year",
          sourcesToggle: "See sources",
          aiBenefitLabel: "AI also",
        }}
      />,
    );
    const summaryUnit = container.querySelector("summary")?.textContent;
    expect(summaryUnit).toContain("programme-years");
    expect(screen.getByText("programme-years").className).not.toMatch(/\bhidden\b/);
    expect(screen.getByText(/^= .*programme-years$/)).toBeInTheDocument();
  });

  it("preserves the selected data source when changing language", () => {
    render(<LanguageSwitcherView currentLocale="en" sourceId="fossil-fuels" />);
    expect(screen.getByRole("link", { name: "DE" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/de\/?\?source=fossil-fuels$/),
    );
  });

  it("marks completion at the exact UTC year boundary, including leap years", () => {
    expect(isProjectionPeriodComplete(2026, new Date("2026-12-31T23:59:59.999Z"))).toBe(false);
    expect(isProjectionPeriodComplete(2026, new Date("2027-01-01T00:00:00.000Z"))).toBe(true);
    expect(isProjectionPeriodComplete(2028, new Date("2028-12-31T23:59:59.999Z"))).toBe(false);
    expect(isProjectionPeriodComplete(2028, new Date("2029-01-01T00:00:00.000Z"))).toBe(true);
  });
});

import type { Category } from "@/data/categories.schema";

export type MatrixMode = "discrete" | "dense";

export type SymbolCountResult = {
  mode: MatrixMode;
  visibleCount: number;
  unitsPerSymbol: number;
};

export function computeCategoryMetric(category: Category, militaryTotalUsd: number): number {
  if (category.unitCostUsd <= 0) {
    throw new Error(`Invalid unitCostUsd for category ${category.id}`);
  }
  return militaryTotalUsd / category.unitCostUsd;
}

const MATRIX_MODE_THRESHOLD = 40;
const DENSE_TARGET = 200;
const DENSE_MAX = 500;

export function pickMatrixMode(metricValue: number): MatrixMode {
  return metricValue < MATRIX_MODE_THRESHOLD ? "discrete" : "dense";
}

/**
 * Pick a "round" units-per-symbol value such that visible count lands near
 * DENSE_TARGET (200) and never exceeds DENSE_MAX (500). The chosen
 * unitsPerSymbol is always a power of 10 times 1, 2, or 5 — what humans read
 * as a "nice" round number.
 */
export function computeSymbolCount(metricValue: number, mode: MatrixMode): SymbolCountResult {
  if (mode === "discrete") {
    return {
      mode: "discrete",
      visibleCount: Math.round(metricValue),
      unitsPerSymbol: 1,
    };
  }

  const rawUnitsPerSymbol = Math.max(1, metricValue / DENSE_TARGET);
  const magnitude = 10 ** Math.floor(Math.log10(rawUnitsPerSymbol));
  const normalized = rawUnitsPerSymbol / magnitude; // in [1, 10)

  let nice: number;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;

  let unitsPerSymbol = nice * magnitude;
  let visibleCount = Math.round(metricValue / unitsPerSymbol);

  // If we still exceed the cap, bump up to the next "nice" step.
  while (visibleCount > DENSE_MAX) {
    unitsPerSymbol *= 2;
    visibleCount = Math.round(metricValue / unitsPerSymbol);
  }

  return {
    mode: "dense",
    visibleCount,
    unitsPerSymbol,
  };
}

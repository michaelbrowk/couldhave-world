export type Projection = {
  totalUsd: number;
  basedOnYear: number;
  baseAmountUsd: number;
  growthFactor: number;
  growthBasis: string;
};

/**
 * Project a future year's total by compounding the base amount with the
 * annual growth factor. `yearsToProject` defaults to 1 year of growth; pass
 * 2 to compound twice (e.g. projecting 2026 from 2024 actuals), etc.
 */
export function projectCurrentYearTotal(
  baseAmountUsd: number,
  growthFactor: number,
  yearsToProject = 1,
): number {
  return baseAmountUsd * growthFactor ** yearsToProject;
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
  const yearStart = Date.UTC(currentYear, 0, 1, 0, 0, 0);
  const elapsed = Math.max(0, Math.floor((now.getTime() - yearStart) / 1000));
  const total = secondsInYear(currentYear);
  const fraction = Math.min(1, elapsed / total);
  return projection.totalUsd * fraction;
}

import raw from "./categories.json";

export type CategorySymbolId = "cross" | "drop" | "grain" | "roof" | "coin" | "leaf" | "ray";

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

export const categories: Category[] = raw as Category[];

import raw from "./military-spending.json";

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
  source: string;
  sourceUrl: string;
  lastUpdated: string;
};

export const militarySpending: MilitarySpendingData = raw as MilitarySpendingData;

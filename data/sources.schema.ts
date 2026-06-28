import { z } from "zod";

export const SOURCE_IDS = [
  "war",
  "tobacco",
  "fossil-fuels",
  "ai",
  "food-waste",
  "advertising",
] as const;
export type SourceId = (typeof SOURCE_IDS)[number];

const SymbolEnum = z.enum(["cross", "drop", "grain", "roof", "coin", "leaf", "ray"]);
const ScaleHintEnum = z.enum(["perUnit", "totalSolution", "annualNeed"]);

const CategorySourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  year: z.number().int(),
});

const CategorySchema = z.object({
  id: z.string().min(1),
  titleKey: z.string().min(1),
  unitLabelKey: z.string().min(1),
  symbol: SymbolEnum,
  scaleHint: ScaleHintEnum,
  unitCostUsd: z.number().positive(),
  sources: z.array(CategorySourceSchema).min(1),
  methodology: z.string().min(1),
  // Optional: a verified positive AI achievement that pairs with this
  // negative comparison. Only populated for the 'ai' source — other
  // sources leave this absent.
  aiBenefit: z
    .object({
      text: z.string().min(1),
      sources: z.array(CategorySourceSchema).min(1),
    })
    .optional(),
});

const ProjectionSchema = z.object({
  totalUsd: z.number().positive(),
  basedOnYear: z.number().int(),
  baseAmountUsd: z.number().positive(),
  /** When present: totalUsd ≈ baseAmountUsd × growthFactor compounded over (currentYear − basedOnYear) years. Absent for flat-annual sources (tobacco, fossil-fuels). */
  growthFactor: z.number().positive().optional(),
  growthBasis: z.string().min(1),
});

const HistoricalEntrySchema = z.object({
  year: z.number().int(),
  totalUsd: z.number().positive(),
  actual: z.boolean(),
});

export const SourceSchema = z.object({
  id: z.enum(SOURCE_IDS),
  labelKey: z.string().min(1),
  currentYear: z.number().int(),
  projection: ProjectionSchema,
  historical: z.array(HistoricalEntrySchema).optional(),
  source: z.string().min(1),
  sourceUrl: z.string().url(),
  lastUpdated: z.string().date(),
  categories: z.array(CategorySchema).min(6),
});

export type Source = z.infer<typeof SourceSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CategorySourceRef = z.infer<typeof CategorySourceSchema>;
export type Projection = z.infer<typeof ProjectionSchema>;
export type HistoricalEntry = z.infer<typeof HistoricalEntrySchema>;
export type CategorySymbolId = z.infer<typeof SymbolEnum>;

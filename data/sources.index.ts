import advertisingJson from "@/data/sources/advertising.json";
import aiJson from "@/data/sources/ai.json";
import foodWasteJson from "@/data/sources/food-waste.json";
import fossilJson from "@/data/sources/fossil-fuels.json";
import gamblingJson from "@/data/sources/gambling.json";
import tobaccoJson from "@/data/sources/tobacco.json";
import warJson from "@/data/sources/war.json";
import { SOURCE_IDS, type Source, type SourceId, SourceSchema } from "@/data/sources.schema";

const warSource: Source = SourceSchema.parse(warJson);
const tobaccoSource: Source = SourceSchema.parse(tobaccoJson);
const fossilSource: Source = SourceSchema.parse(fossilJson);
const aiSource: Source = SourceSchema.parse(aiJson);
const foodWasteSource: Source = SourceSchema.parse(foodWasteJson);
const advertisingSource: Source = SourceSchema.parse(advertisingJson);
const gamblingSource: Source = SourceSchema.parse(gamblingJson);

export const SOURCES: Record<SourceId, Source> = {
  ai: aiSource,
  war: warSource,
  tobacco: tobaccoSource,
  "fossil-fuels": fossilSource,
  "food-waste": foodWasteSource,
  advertising: advertisingSource,
  gambling: gamblingSource,
};

export const SOURCES_LIST: readonly Source[] = SOURCE_IDS.map((id) => SOURCES[id]);

export function getSource(id: SourceId): Source {
  return SOURCES[id];
}

import aiJson from "@/data/sources/ai.json";
import fossilJson from "@/data/sources/fossil-fuels.json";
import tobaccoJson from "@/data/sources/tobacco.json";
import warJson from "@/data/sources/war.json";
import { SOURCE_IDS, type Source, type SourceId, SourceSchema } from "@/data/sources.schema";

const warSource: Source = SourceSchema.parse(warJson);
const tobaccoSource: Source = SourceSchema.parse(tobaccoJson);
const fossilSource: Source = SourceSchema.parse(fossilJson);
const aiSource: Source = SourceSchema.parse(aiJson);

export const SOURCES: Record<SourceId, Source> = {
  ai: aiSource,
  war: warSource,
  tobacco: tobaccoSource,
  "fossil-fuels": fossilSource,
};

export const SOURCES_LIST: readonly Source[] = SOURCE_IDS.map((id) => SOURCES[id]);

export function getSource(id: SourceId): Source {
  return SOURCES[id];
}

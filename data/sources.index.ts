import warJson from "@/data/sources/war.json";
import tobaccoJson from "@/data/sources/tobacco.json";
import fossilJson from "@/data/sources/fossil-fuels.json";
import { type Source, SourceSchema, type SourceId, SOURCE_IDS } from "@/data/sources.schema";

const warSource: Source = SourceSchema.parse(warJson);
const tobaccoSource: Source = SourceSchema.parse(tobaccoJson);
const fossilSource: Source = SourceSchema.parse(fossilJson);

export const SOURCES: Record<SourceId, Source> = {
  war: warSource,
  tobacco: tobaccoSource,
  "fossil-fuels": fossilSource,
};

export const SOURCES_LIST: readonly Source[] = SOURCE_IDS.map((id) => SOURCES[id]);

export function getSource(id: SourceId): Source {
  return SOURCES[id];
}

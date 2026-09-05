import { SOURCE_IDS, type SourceId } from "@/data/sources.schema";

export type { SourceId };
export { SOURCE_IDS };

export function isValidSourceId(value: unknown): value is SourceId {
  return typeof value === "string" && (SOURCE_IDS as readonly string[]).includes(value);
}

export function parseSourceId(value: string | null | undefined): SourceId | null {
  return isValidSourceId(value) ? value : null;
}

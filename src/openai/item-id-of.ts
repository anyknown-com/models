import type { ResponsesEvent } from "./types";

export const itemIdOf = (
  { output_index: index }: ResponsesEvent,
  itemIds: ReadonlyMap<number, string>,
  fallback: string,
): string => (typeof index === "number" ? itemIds.get(index) : undefined) ?? fallback;

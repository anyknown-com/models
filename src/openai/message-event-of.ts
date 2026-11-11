import type { StreamEvent } from "../types/stream-event";
import { itemIdOf } from "./item-id-of";
import type { ResponsesEvent } from "./types";

export function messageEventOf(
  event: ResponsesEvent,
  itemIds: Map<number, string>,
): StreamEvent | undefined {
  const { type, item, output_index: index } = event;

  if (item?.type !== "message") return undefined;

  if (type === "response.output_item.added") {
    const id = item.id ?? "";

    if (typeof index === "number") itemIds.set(index, id);

    return { type: "text-start", id };
  }

  if (type !== "response.output_item.done") return undefined;

  const id = itemIdOf(event, itemIds, item.id ?? "");

  if (typeof index === "number") itemIds.delete(index);

  return { type: "text-end", id };
}

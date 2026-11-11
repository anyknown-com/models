import type { StreamEvent } from "../types/stream-event";
import { itemIdOf } from "./item-id-of";
import { messageEventOf } from "./message-event-of";
import type { ResponsesEvent } from "./types";

export function contentEventOf(
  event: ResponsesEvent,
  itemIds: Map<number, string>,
): StreamEvent | undefined {
  const { type, item_id: itemId = "", delta = "" } = event;

  if (type === "response.output_text.delta") {
    return { type: "text", id: itemIdOf(event, itemIds, itemId), delta };
  }

  if (type === "response.reasoning_summary_text.delta") return { type: "reasoning", delta };

  return messageEventOf(event, itemIds);
}

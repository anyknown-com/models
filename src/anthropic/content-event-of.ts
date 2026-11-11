import type { StreamEvent } from "../types/stream-event";
import { deltaEventOf } from "./delta-event-of";
import type { MessagesEvent } from "./types";

export function contentEventOf(event: MessagesEvent, texts: Set<number>): StreamEvent | undefined {
  const { type, index = 0, content_block: block, delta } = event;
  const id = String(index);

  if (type === "content_block_start" && block?.type === "text") {
    texts.add(index);

    return { type: "text-start", id };
  }

  if (type === "content_block_stop" && texts.has(index)) {
    texts.delete(index);

    return { type: "text-end", id };
  }

  return type === "content_block_delta" ? deltaEventOf(id, delta) : undefined;
}

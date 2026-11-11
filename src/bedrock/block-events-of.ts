import type { StreamEvent } from "../types/stream-event";
import { deltaEventsOf } from "./delta-events-of";
import type { BlockKind, ConverseEvent } from "./types";

export function blockEventsOf(event: ConverseEvent, blocks: Map<number, BlockKind>): StreamEvent[] {
  const { contentBlockStart: start, contentBlockDelta: delta, contentBlockStop: stop } = event;

  if (start && !start.start?.toolUse) {
    blocks.set(start.contentBlockIndex, "text");

    return [{ type: "text-start", id: String(start.contentBlockIndex) }];
  }

  if (delta) return deltaEventsOf(delta.contentBlockIndex, delta.delta, blocks);
  if (!stop) return [];

  const kind = blocks.get(stop.contentBlockIndex);

  blocks.delete(stop.contentBlockIndex);

  return kind === "text" ? [{ type: "text-end", id: String(stop.contentBlockIndex) }] : [];
}

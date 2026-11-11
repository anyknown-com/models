import type { StreamEvent } from "../types/stream-event";
import { reasoningEventsOf } from "./reasoning-events-of";
import type { BlockDelta, BlockKind } from "./types";

export function deltaEventsOf(
  index: number,
  delta: BlockDelta | null | undefined,
  blocks: Map<number, BlockKind>,
): StreamEvent[] {
  const id = String(index);
  const opened = blocks.has(index);
  const reasoning = delta?.reasoningContent ?? {};

  if (delta?.text) {
    if (!opened) blocks.set(index, "text");

    const text: StreamEvent = { type: "text", id, delta: delta.text };

    return opened ? [text] : [{ type: "text-start", id }, text];
  }

  if (!(reasoning.text || reasoning.signature || reasoning.data || reasoning.redactedContent)) {
    return [];
  }

  if (!opened) blocks.set(index, "reasoning");

  return reasoningEventsOf(reasoning);
}

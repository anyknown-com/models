import type { StreamEvent } from "../types/stream-event";
import type { ReasoningDelta } from "./types";

export function reasoningEventsOf({ text, signature, data }: ReasoningDelta): StreamEvent[] {
  if (text) return [{ type: "reasoning", delta: text }];

  return signature || data ? [{ type: "reasoning", delta: "" }] : [];
}

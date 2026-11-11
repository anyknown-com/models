import type { StreamEvent } from "../types/stream-event";
import type { MessagesEvent } from "./types";

export function deltaEventOf(id: string, delta: MessagesEvent["delta"]): StreamEvent | undefined {
  if (delta?.type === "text_delta") return { type: "text", id, delta: delta.text ?? "" };
  if (delta?.type === "thinking_delta") return { type: "reasoning", delta: delta.thinking ?? "" };
  if (delta?.type === "signature_delta") return { type: "reasoning", delta: "" };

  return undefined;
}

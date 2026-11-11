import type { StreamEvent } from "../types/stream-event";
import { toolInputOf } from "../wire/tool-input-of";
import { callIdOf } from "./call-id-of";
import type { GooglePartChunk } from "./types";

export const readToolCalls = (
  parts: GooglePartChunk[] = [],
  declared: ReadonlySet<string>,
): StreamEvent[] =>
  parts.flatMap(({ functionCall: call }): StreamEvent[] => {
    if (typeof call?.name !== "string") return [];

    const { name, args } = call;
    const callId = callIdOf(call.id);
    const text = typeof args === "string" ? args : JSON.stringify(args ?? {});

    return [
      { type: "tool-input-start", callId, name },
      { type: "tool-call", callId, name, input: toolInputOf(text, declared.has(name)) },
    ];
  });

import type { StreamEvent } from "../types/stream-event";
import type { GooglePartChunk } from "./types";

export function readParts() {
  let blocks = 0;
  let textId: string | undefined;
  let thinking = false;

  const reasoningOf = (delta: string): StreamEvent[] => {
    const closing: StreamEvent[] = textId === undefined ? [] : [{ type: "text-end", id: textId }];

    if (!thinking) blocks += 1;

    textId = undefined;
    thinking = true;

    return [...closing, { type: "reasoning", delta }];
  };

  const textOf = (delta: string): StreamEvent[] => {
    const opening = textId === undefined;

    textId ??= String(blocks++);
    thinking = false;

    return [
      ...(opening ? [{ type: "text-start", id: textId } as const] : []),
      { type: "text", id: textId, delta },
    ];
  };

  const read = (parts: GooglePartChunk[] = []): StreamEvent[] =>
    parts.flatMap(({ text, thought, thoughtSignature }) => {
      if (text) return thought === true ? reasoningOf(text) : textOf(text);

      return text === "" && thoughtSignature && textId !== undefined
        ? [{ type: "text", id: textId, delta: "" }]
        : [];
    });

  const finish = (): StreamEvent[] =>
    textId === undefined ? [] : [{ type: "text-end", id: textId }];

  return { read, finish };
}

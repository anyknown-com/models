import type { StreamEvent } from "../types/stream-event";
import { deltasOf } from "./deltas-of";
import type { ChatDelta } from "./types";

const TEXT_ID = "txt-0";

export function readText() {
  let open = false;

  const read = (delta: ChatDelta | null | undefined): StreamEvent[] =>
    deltasOf(delta).flatMap(({ type, text }): StreamEvent[] => {
      const closing: StreamEvent[] =
        type === "reasoning" && open ? [{ type: "text-end", id: TEXT_ID }] : [];

      const opening: StreamEvent[] =
        type === "text" && !open ? [{ type: "text-start", id: TEXT_ID }] : [];

      open = type === "text";

      return [
        ...closing,
        ...opening,
        type === "text" ? { type, id: TEXT_ID, delta: text } : { type, delta: text },
      ];
    });

  const finish = (): StreamEvent[] => (open ? [{ type: "text-end", id: TEXT_ID }] : []);

  return { read, finish };
}

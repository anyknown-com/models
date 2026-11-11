import { streamErrorOf } from "../wire/stream-error-of";
import { PROVIDER } from "./constants";
import { frameLengthOf } from "./frame-length-of";
import { frameOf } from "./frame-of";
import type { EventFrame } from "./types";

const joined = (head: Uint8Array, tail: Uint8Array) => {
  const bytes = new Uint8Array(head.length + tail.length);

  bytes.set(head);
  bytes.set(tail, head.length);

  return bytes;
};

export async function* readEventStream(
  body: ReadableStream<Uint8Array>,
): AsyncIterable<EventFrame> {
  const reader = body.getReader();
  let buffered = new Uint8Array(0);

  try {
    let chunk = await reader.read();

    while (!chunk.done) {
      buffered = joined(buffered, chunk.value);

      let length = frameLengthOf(buffered);

      while (length !== undefined && buffered.length >= length) {
        yield frameOf(buffered.subarray(0, length));
        buffered = buffered.slice(length);
        length = frameLengthOf(buffered);
      }

      chunk = await reader.read();
    }

    if (buffered.length > 0) throw streamErrorOf(PROVIDER, "Event stream ended inside a frame.");
  } finally {
    await reader.cancel();
  }
}

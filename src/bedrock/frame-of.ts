import { streamErrorOf } from "../wire/stream-error-of";
import { CRC_LENGTH, PRELUDE_LENGTH, PROVIDER } from "./constants";
import { crc32 } from "./crc32";
import { headersOf } from "./headers-of";
import type { EventFrame } from "./types";

export function frameOf(frame: Uint8Array): EventFrame {
  const view = new DataView(frame.buffer, frame.byteOffset, frame.byteLength);
  const headersEnd = PRELUDE_LENGTH + view.getUint32(4);
  const payloadEnd = frame.length - CRC_LENGTH;

  if (crc32(frame.subarray(0, payloadEnd)) !== view.getUint32(payloadEnd)) {
    throw streamErrorOf(PROVIDER, "Event stream message checksum does not match.");
  }

  return {
    headers: headersOf(frame.subarray(PRELUDE_LENGTH, headersEnd)),
    payload: frame.slice(headersEnd, payloadEnd),
  };
}

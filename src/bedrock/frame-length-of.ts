import { streamErrorOf } from "../wire/stream-error-of";
import { CRC_LENGTH, PRELUDE_CRC_AT, PRELUDE_LENGTH, PROVIDER } from "./constants";
import { crc32 } from "./crc32";

export function frameLengthOf(buffered: Uint8Array): number | undefined {
  if (buffered.length < PRELUDE_LENGTH) return undefined;

  const view = new DataView(buffered.buffer, buffered.byteOffset, PRELUDE_LENGTH);
  const length = view.getUint32(0);

  if (crc32(buffered.subarray(0, PRELUDE_CRC_AT)) !== view.getUint32(PRELUDE_CRC_AT)) {
    throw streamErrorOf(PROVIDER, "Event stream prelude checksum does not match.");
  }

  if (length < PRELUDE_LENGTH + view.getUint32(4) + CRC_LENGTH) {
    throw streamErrorOf(PROVIDER, "Event stream frame is shorter than its headers.");
  }

  return length;
}

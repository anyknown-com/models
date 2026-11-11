import { streamErrorOf } from "../wire/stream-error-of";
import { FIXED_VALUE_LENGTHS, LENGTH_PREFIXED_TYPES, PROVIDER } from "./constants";

export function valueRangeOf(view: DataView, type: number, at: number): [number, number] {
  if (LENGTH_PREFIXED_TYPES.includes(type)) return [at + 2, at + 2 + view.getUint16(at)];

  const length = FIXED_VALUE_LENGTHS[type];

  if (length === undefined) {
    throw streamErrorOf(PROVIDER, `Event stream header has unknown value type ${type}.`);
  }

  return [at, at + length];
}

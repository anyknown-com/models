import { REPEAT_MIN, REPEAT_UNIT_MAX } from "./constants.mjs";

const UNIT_SIZES = Array.from({ length: REPEAT_UNIT_MAX }, (_, index) => index + 1);

const repeats = (text, size) =>
  text.length % size === 0 &&
  text.startsWith(text.slice(0, size), size) &&
  text === text.slice(0, size).repeat(text.length / size);

export function repeatOf(value) {
  if (typeof value !== "string" || value.length < REPEAT_MIN) return undefined;

  const size = UNIT_SIZES.find((unit) => repeats(value, unit));

  return size && { $repeat: value.slice(0, size), times: value.length / size };
}

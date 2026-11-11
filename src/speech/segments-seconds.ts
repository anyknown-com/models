import { fieldOf } from "./field-of";
import { lastEnd } from "./last-end";

export function segmentsSeconds(body: unknown): number | null {
  const segments = fieldOf(body, "segments");

  return Array.isArray(segments) ? lastEnd(segments) : null;
}

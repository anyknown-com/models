import { fieldOf } from "../speech/field-of";
import { lastEnd } from "../speech/last-end";

export function transcriptionSeconds(body: unknown): number | null {
  const words = fieldOf(body, "words");

  return Array.isArray(words) ? lastEnd(words) : null;
}

import { fieldOf } from "../speech/field-of";

export function transcriptionSeconds(body: unknown): number | null {
  const duration = fieldOf(body, "duration");

  if (typeof duration === "number") return duration;

  const usage = fieldOf(body, "usage");
  const seconds = fieldOf(usage, "seconds");

  return fieldOf(usage, "type") === "duration" && typeof seconds === "number" ? seconds : null;
}

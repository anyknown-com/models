import { fieldOf } from "../speech/field-of";
import type { TranscribeResult } from "../types/transcribe-request";

const firstOf = (value: unknown): unknown => (Array.isArray(value) ? value[0] : undefined);

export function readTranscription(body: unknown): Omit<TranscribeResult, "raw"> {
  const channel = firstOf(fieldOf(fieldOf(body, "results"), "channels"));
  const transcript = fieldOf(firstOf(fieldOf(channel, "alternatives")), "transcript");
  const duration = fieldOf(fieldOf(body, "metadata"), "duration");

  return {
    text: typeof transcript === "string" ? transcript : "",
    usage: { amount: typeof duration === "number" ? duration : null, unit: "seconds" },
  };
}

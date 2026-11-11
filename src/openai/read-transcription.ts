import { fieldOf } from "../speech/field-of";

export function readTranscription(body: unknown): string {
  const text = fieldOf(body, "text");

  return typeof text === "string" ? text : "";
}

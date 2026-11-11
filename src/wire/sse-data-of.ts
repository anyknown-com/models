import type { ModelError } from "../model-error";
import { streamErrorOf } from "./stream-error-of";

export function sseDataOf<T>(provider: string, data: string): T | ModelError {
  try {
    return JSON.parse(data);
  } catch (error) {
    return streamErrorOf(
      provider,
      `JSON parsing failed: Text: ${data}.\nError message: ${String(error)}`,
    );
  }
}

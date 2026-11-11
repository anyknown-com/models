import type { ModelError } from "../model-error";
import { errorOf } from "./error-of";
import { streamErrorOf } from "./stream-error-of";
import type { ChatChunk } from "./types";

const invalidJson = (provider: string, data: string, error: unknown): ModelError =>
  streamErrorOf(provider, `JSON parsing failed: Text: ${data}.\nError message: ${String(error)}`);

export function chunkOf(provider: string, data: string): ChatChunk | ModelError {
  let chunk: ChatChunk;

  try {
    chunk = JSON.parse(data);
  } catch (error) {
    return invalidJson(provider, data, error);
  }

  const failed = errorOf(chunk);

  return failed ? streamErrorOf(provider, failed.message, failed.code) : chunk;
}

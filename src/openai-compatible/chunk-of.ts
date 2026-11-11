import { ModelError } from "../model-error";
import { sseDataOf } from "../wire/sse-data-of";
import { streamErrorOf } from "../wire/stream-error-of";
import { errorOf } from "./error-of";
import type { ChatChunk } from "./types";

export function chunkOf(provider: string, data: string): ChatChunk | ModelError {
  const chunk = sseDataOf<ChatChunk>(provider, data);

  if (chunk instanceof ModelError) return chunk;

  const failed = errorOf(chunk);

  return failed ? streamErrorOf(provider, failed.message, failed.code) : chunk;
}

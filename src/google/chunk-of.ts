import { ModelError } from "../model-error";
import { sseDataOf } from "../wire/sse-data-of";
import { streamErrorOf } from "../wire/stream-error-of";
import { PROVIDER } from "./constants";
import { errorOf } from "./error-of";
import { mistypedFieldOf } from "./mistyped-field-of";
import type { GenerateContentChunk } from "./types";

export function chunkOf(data: string): GenerateContentChunk | ModelError {
  const chunk = sseDataOf<unknown>(PROVIDER, data);

  if (chunk instanceof ModelError) return chunk;

  const failed = errorOf(chunk);

  if (failed) return streamErrorOf(PROVIDER, failed.message, failed.code);

  const mistyped = mistypedFieldOf(chunk);

  if (mistyped === undefined) return chunk as GenerateContentChunk;

  return streamErrorOf(
    PROVIDER,
    `Type validation failed: Value: ${data}.\nError message: ${mistyped}`,
  );
}

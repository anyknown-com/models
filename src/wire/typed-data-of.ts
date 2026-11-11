import { ModelError } from "../model-error";
import { mistypedFieldOf } from "./mistyped-field-of";
import { sseDataOf } from "./sse-data-of";
import { streamErrorOf } from "./stream-error-of";
import type { ReadField } from "./types";

export function typedDataOf<T>(
  provider: string,
  data: string,
  fieldsOf: (event: unknown) => readonly ReadField[],
): T | ModelError {
  const event = sseDataOf<unknown>(provider, data);

  if (event instanceof ModelError) return event;

  const mistyped = mistypedFieldOf(event, fieldsOf(event));

  if (mistyped === undefined) return event as T;

  return streamErrorOf(
    provider,
    `Type validation failed: Value: ${data}.\nError message: ${mistyped}`,
  );
}

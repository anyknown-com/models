import { ModelError } from "../model-error";
import { sseDataOf } from "../wire/sse-data-of";
import { streamErrorOf } from "../wire/stream-error-of";
import { mistypedFieldOf } from "./mistyped-field-of";
import type { MessagesEvent } from "./types";

export function messagesEventOf(provider: string, data: string): MessagesEvent | ModelError {
  const event = sseDataOf<unknown>(provider, data);

  if (event instanceof ModelError) return event;

  const mistyped = mistypedFieldOf(event);

  if (mistyped === undefined) return event as MessagesEvent;

  return streamErrorOf(
    provider,
    `Type validation failed: Value: ${data}.\nError message: ${mistyped}`,
  );
}

import { ModelError } from "../model-error";
import { fieldOf } from "../speech/field-of";
import { sseDataOf } from "../wire/sse-data-of";
import { typedDataOf } from "../wire/typed-data-of";
import { PROVIDER, READ_FIELDS } from "./constants";
import { readFieldsOf } from "./read-fields-of";
import type { ConverseEvent, EventFrame } from "./types";

const decoder = new TextDecoder();

const withoutPadding = (payload: unknown): unknown =>
  fieldOf(payload, "p") === undefined ? payload : { ...(payload as object), p: undefined };

export function converseEventOf({
  headers,
  payload,
}: EventFrame): ConverseEvent | ModelError | undefined {
  const type = headers[":event-type"];

  if (headers[":message-type"] !== "event" || type === undefined) return undefined;

  const parsed = sseDataOf<unknown>(PROVIDER, decoder.decode(payload));

  if (parsed instanceof ModelError) return parsed;
  if (!(type in READ_FIELDS)) return {};

  const data = JSON.stringify({ [type]: withoutPadding(parsed) });

  return typedDataOf<ConverseEvent>(PROVIDER, data, (event) => readFieldsOf(type, event));
}

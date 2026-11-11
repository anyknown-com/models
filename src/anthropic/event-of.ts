import { ModelError } from "../model-error";
import { httpErrorOf } from "../wire/http-error-of";
import { streamErrorOf } from "../wire/stream-error-of";
import { typedDataOf } from "../wire/typed-data-of";
import { READ_FIELDS, STREAM_ERROR_STATUS, UNKNOWN_STREAM_ERROR_STATUS } from "./constants";
import { modelErrorOf } from "./model-error-of";
import type { MessagesEvent } from "./types";

export function eventOf(
  provider: string,
  data: string,
  first: boolean,
): MessagesEvent | ModelError {
  const event = typedDataOf<MessagesEvent>(provider, data, () => READ_FIELDS);

  if (event instanceof ModelError || event.type !== "error") return event;

  const status = STREAM_ERROR_STATUS[event.error?.type ?? ""] ?? UNKNOWN_STREAM_ERROR_STATUS;

  if (first) throw httpErrorOf(provider, status, data, modelErrorOf);

  const { message, code } = modelErrorOf(data, status);

  return streamErrorOf(provider, message, code);
}

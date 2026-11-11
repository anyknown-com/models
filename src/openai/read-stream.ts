import { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { readSse } from "../wire/read-sse";
import { sseDataOf } from "../wire/sse-data-of";
import { contentEventOf } from "./content-event-of";
import { finishEventsOf } from "./finish-events-of";
import { finishReasonOf } from "./finish-reason-of";
import type { ResponsesEvent } from "./types";

const FINISHED = new Set(["response.completed", "response.incomplete"]);

export async function* readStream(
  provider: string,
  body: ReadableStream<Uint8Array>,
): AsyncIterable<StreamEvent> {
  const itemIds = new Map<number, string>();
  let reason: FinishReason | undefined;
  let usage: JsonObject | undefined;
  let failure: ModelError | undefined;

  for await (const { data } of readSse(body)) {
    const event = sseDataOf<ResponsesEvent>(provider, data);

    if (event instanceof ModelError) {
      failure = event;
      continue;
    }

    if (FINISHED.has(event.type)) {
      reason = finishReasonOf(event.response?.incomplete_details?.reason);
      usage = event.response?.usage ?? undefined;
    }

    const content = contentEventOf(event, itemIds);

    if (content) yield content;
  }

  yield* finishEventsOf(provider, reason, usage, failure);
}

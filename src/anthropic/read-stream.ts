import { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { finishEventsOf } from "../wire/finish-events-of";
import { readSse } from "../wire/read-sse";
import { contentEventOf } from "./content-event-of";
import { eventOf } from "./event-of";
import { finishReasonOf } from "./finish-reason-of";
import { readToolCalls } from "./read-tool-calls";
import { tokenUsageOf } from "./token-usage-of";

export async function* readStream(
  provider: string,
  body: ReadableStream<Uint8Array>,
  declared: ReadonlySet<string>,
): AsyncIterable<StreamEvent> {
  const toolCallsOf = readToolCalls(declared);
  const texts = new Set<number>();
  let started = false;
  let start: JsonObject | undefined;
  let delta: JsonObject | undefined;
  let reason: FinishReason | undefined;
  let failure: ModelError | undefined;

  for await (const { data } of readSse(body)) {
    const event = eventOf(provider, data, !started);

    started ||= event instanceof ModelError || event.type !== "ping";

    if (event instanceof ModelError) {
      failure = event;
      continue;
    }

    if (event.type === "message_start") start = event.message?.usage;

    if (event.type === "message_delta") {
      delta = { ...delta, ...event.usage };
      reason = finishReasonOf(event.delta?.stop_reason);
    }

    const content = contentEventOf(event, texts);

    if (content) yield content;

    yield* toolCallsOf(event);
  }

  const raw = start || delta ? { ...start, ...delta } : undefined;

  yield* finishEventsOf(provider, { reason, usage: tokenUsageOf(start, delta), raw, failure });
}

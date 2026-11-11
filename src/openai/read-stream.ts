import { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { finishEventsOf } from "../wire/finish-events-of";
import { readSse } from "../wire/read-sse";
import { NOT_OUTPUT } from "./constants";
import { contentEventOf } from "./content-event-of";
import { endReasonOf } from "./end-reason-of";
import { eventFailureOf } from "./event-failure-of";
import { responsesEventOf } from "./responses-event-of";
import { tokenUsageOf } from "./token-usage-of";
import { toolCallEventsOf } from "./tool-call-events-of";

export async function* readStream(
  provider: string,
  body: ReadableStream<Uint8Array>,
  declared: ReadonlySet<string>,
): AsyncIterable<StreamEvent> {
  const itemIds = new Map<number, string>();
  let started = false;
  let called = false;
  let reason: FinishReason | undefined;
  let usage: JsonObject | undefined;
  let failure: ModelError | undefined;

  for await (const { data } of readSse(body)) {
    const event = responsesEventOf(provider, data);
    const failed = eventFailureOf(provider, data, event, started);

    started ||= event instanceof ModelError || !NOT_OUTPUT.has(event.type);

    if (failed) {
      failure = failed;
      reason = "error";
    }

    if (event instanceof ModelError) continue;

    reason = endReasonOf(event, called, reason, failure !== undefined);
    usage = event.response?.usage ?? usage;

    const content = contentEventOf(event, itemIds);
    const toolCalls = toolCallEventsOf(event, declared);

    called ||= toolCalls.some(({ type }) => type === "tool-call");

    if (content) yield content;

    yield* toolCalls;
  }

  yield* finishEventsOf(provider, { reason, usage: tokenUsageOf(usage), raw: usage, failure });
}

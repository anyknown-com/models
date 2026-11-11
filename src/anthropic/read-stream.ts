import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { readSse } from "../wire/read-sse";
import { contentEventOf } from "./content-event-of";
import { finishEventsOf } from "./finish-events-of";
import { finishReasonOf } from "./finish-reason-of";
import { readToolCalls } from "./read-tool-calls";
import type { MessagesEvent } from "./types";

export async function* readStream(
  provider: string,
  body: ReadableStream<Uint8Array>,
  declared: ReadonlySet<string>,
): AsyncIterable<StreamEvent> {
  const toolCallsOf = readToolCalls(declared);
  const texts = new Set<number>();
  let start: JsonObject | undefined;
  let delta: JsonObject | undefined;
  let reason: FinishReason | undefined;

  for await (const { data } of readSse(body)) {
    const event: MessagesEvent = JSON.parse(data);

    if (event.type === "message_start") start = event.message?.usage;

    if (event.type === "message_delta") {
      delta = { ...delta, ...event.usage };
      reason = finishReasonOf(event.delta?.stop_reason);
    }

    const content = contentEventOf(event, texts);

    if (content) yield content;

    yield* toolCallsOf(event);
  }

  yield* finishEventsOf(provider, reason, start, delta);
}

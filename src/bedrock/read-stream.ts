import { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { finishEventsOf } from "../wire/finish-events-of";
import { blockEventsOf } from "./block-events-of";
import { PROVIDER } from "./constants";
import { converseEventOf } from "./converse-event-of";
import { finishReasonOf } from "./finish-reason-of";
import { readEventStream } from "./read-event-stream";
import { tokenUsageOf } from "./token-usage-of";
import type { BlockKind } from "./types";

export async function* readStream(body: ReadableStream<Uint8Array>): AsyncIterable<StreamEvent> {
  const blocks = new Map<number, BlockKind>();
  let reason: FinishReason | undefined;
  let usage: JsonObject | undefined;
  let failure: ModelError | undefined;

  for await (const frame of readEventStream(body)) {
    const event = converseEventOf(frame);

    if (event instanceof ModelError) {
      failure = event;
      reason = "error";
      continue;
    }

    if (event?.messageStop) reason = finishReasonOf(event.messageStop.stopReason);
    if (event?.metadata?.usage) usage = event.metadata.usage;
    if (event) yield* blockEventsOf(event, blocks);
  }

  yield* finishEventsOf(PROVIDER, { reason, usage: tokenUsageOf(usage), raw: usage, failure });
}

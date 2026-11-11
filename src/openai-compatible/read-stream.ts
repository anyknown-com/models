import { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { finishEventsOf } from "../wire/finish-events-of";
import { readSse } from "../wire/read-sse";
import { chunkOf } from "./chunk-of";
import { finishReasonOf } from "./finish-reason-of";
import { readText } from "./read-text";
import { readToolCalls } from "./read-tool-calls";
import { tokenUsageOf } from "./token-usage-of";

export async function* readStream(
  provider: string,
  body: ReadableStream<Uint8Array>,
  declared: ReadonlySet<string>,
): AsyncIterable<StreamEvent> {
  const text = readText();
  const toolCalls = readToolCalls(provider, declared);
  let reason: FinishReason | undefined;
  let usage: JsonObject | undefined;
  let failure: ModelError | undefined;

  for await (const { data } of readSse(body)) {
    if (data === "[DONE]") break;

    const chunk = chunkOf(provider, data);

    if (chunk instanceof ModelError) {
      failure = chunk;
      reason = "error";
      continue;
    }

    const choice = chunk.choices?.[0];
    const delta = choice?.delta;

    if (chunk.usage) usage = chunk.usage;
    if (choice?.finish_reason) reason = finishReasonOf(choice.finish_reason);

    yield* text.read(delta);
    yield* toolCalls.read(delta);
  }

  yield* text.finish();

  yield* toolCalls.finish();

  yield* finishEventsOf(provider, {
    reason,
    usage: tokenUsageOf(usage),
    raw: usage,
    failure: failure ?? toolCalls.failure(),
  });
}

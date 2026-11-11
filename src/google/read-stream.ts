import { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { finishEventsOf } from "../wire/finish-events-of";
import { readSse } from "../wire/read-sse";
import { chunkOf } from "./chunk-of";
import { PROVIDER } from "./constants";
import { finishReasonOf } from "./finish-reason-of";
import { readParts } from "./read-parts";
import { readToolCalls } from "./read-tool-calls";
import { tokenUsageOf } from "./token-usage-of";

export async function* readStream(
  body: ReadableStream<Uint8Array>,
  declared: ReadonlySet<string>,
): AsyncIterable<StreamEvent> {
  const parts = readParts();
  let hasToolCalls = false;
  let reason: FinishReason | undefined;
  let usage: JsonObject | undefined;
  let failure: ModelError | undefined;

  for await (const { data } of readSse(body)) {
    const chunk = chunkOf(data);

    if (chunk instanceof ModelError) {
      failure = chunk;
      continue;
    }

    const candidate = chunk.candidates?.[0];
    const content = candidate?.content?.parts ?? [];
    const calls = readToolCalls(content, declared);

    hasToolCalls ||= calls.length > 0;

    if (chunk.usageMetadata) usage = chunk.usageMetadata;
    if (candidate?.finishReason) reason = finishReasonOf(candidate.finishReason, hasToolCalls);
    if (!candidate?.finishReason && chunk.promptFeedback?.blockReason) reason = "content-filter";

    yield* parts.read(content);
    yield* calls;
  }

  yield* parts.finish();

  yield* finishEventsOf(PROVIDER, { reason, usage: tokenUsageOf(usage), raw: usage, failure });
}

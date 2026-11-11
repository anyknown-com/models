import { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { readSse } from "../wire/read-sse";
import { sseDataOf } from "../wire/sse-data-of";
import { PROVIDER } from "./constants";
import { finishEventsOf } from "./finish-events-of";
import { finishReasonOf } from "./finish-reason-of";
import { readParts } from "./read-parts";
import type { GenerateContentChunk } from "./types";

export async function* readStream(body: ReadableStream<Uint8Array>): AsyncIterable<StreamEvent> {
  const parts = readParts();
  let reason: FinishReason | undefined;
  let usage: JsonObject | undefined;
  let failure: ModelError | undefined;

  for await (const { data } of readSse(body)) {
    const chunk = sseDataOf<GenerateContentChunk>(PROVIDER, data);

    if (chunk instanceof ModelError) {
      failure = chunk;
      continue;
    }

    const candidate = chunk.candidates?.[0];

    if (chunk.usageMetadata) usage = chunk.usageMetadata;
    if (candidate?.finishReason) reason = finishReasonOf(candidate.finishReason);

    yield* parts.read(candidate?.content?.parts);
  }

  yield* parts.finish();

  yield* finishEventsOf(reason, usage, failure);
}

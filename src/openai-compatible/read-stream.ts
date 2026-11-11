import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { readSse } from "../wire/read-sse";
import { deltasOf } from "./deltas-of";
import { finishEventsOf } from "./finish-events-of";
import { finishReasonOf } from "./finish-reason-of";
import { readToolCalls } from "./read-tool-calls";
import type { ChatChunk } from "./types";

const TEXT_ID = "txt-0";

export async function* readStream(
  provider: string,
  body: ReadableStream<Uint8Array>,
  declared: ReadonlySet<string>,
): AsyncIterable<StreamEvent> {
  const toolCalls = readToolCalls(declared);
  let reason: FinishReason | undefined;
  let usage: JsonObject | undefined;
  let textOpen = false;

  for await (const { data } of readSse(body)) {
    if (data === "[DONE]") break;

    const chunk: ChatChunk = JSON.parse(data);
    const choice = chunk.choices?.[0];
    const delta = choice?.delta;

    if (chunk.usage) usage = chunk.usage;
    if (choice?.finish_reason) reason = finishReasonOf(choice.finish_reason);

    for (const { type, text } of deltasOf(delta)) {
      if (type === "reasoning" && textOpen) yield { type: "text-end", id: TEXT_ID };
      if (type === "text" && !textOpen) yield { type: "text-start", id: TEXT_ID };

      textOpen = type === "text";
      yield type === "text" ? { type, id: TEXT_ID, delta: text } : { type, delta: text };
    }

    yield* toolCalls.read(delta);
  }

  if (textOpen) yield { type: "text-end", id: TEXT_ID };

  yield* toolCalls.finish();

  yield* finishEventsOf(provider, reason, usage);
}

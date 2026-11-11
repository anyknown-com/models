import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import { modelErrorOf } from "./model-error-of";
import { readStream } from "./read-stream";
import type { OpenaiCompatibleConfig } from "./types";

export async function* streamChat(
  config: OpenaiCompatibleConfig,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { name, fetch } = config;

  const response = await post({
    provider: name,
    ...buildRequest(config, request),
    fetch,
    signal: request.signal,
    errorOf: modelErrorOf,
  });

  const declared = new Set(request.tools?.map((tool) => tool.name));

  try {
    yield* readStream(name, response.body ?? new Blob().stream(), declared);
  } catch (error) {
    if (!request.signal?.aborted) throw error;

    yield { type: "abort" };
  }
}

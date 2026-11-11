import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import { modelErrorOf } from "./model-error-of";
import { readStream } from "./read-stream";
import type { AnthropicCall } from "./types";

export async function* streamMessages(
  call: AnthropicCall,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { provider, fetch } = call;
  const { signal } = request;
  const { url, headers, body } = buildRequest(call, request);

  const response = await post({
    provider,
    url,
    headers,
    body,
    fetch,
    signal,
    errorOf: modelErrorOf,
  });

  const declared = new Set(request.tools?.map((tool) => tool.name));

  try {
    yield* readStream(provider, response.body ?? new Blob().stream(), declared);
  } catch (error) {
    if (!signal?.aborted) throw error;

    yield { type: "abort" };
  }
}

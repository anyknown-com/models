import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
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
    errorOf: (text) => ({ message: text }),
  });

  yield* readStream(provider, response.body ?? new Blob().stream());
}

import { ModelError } from "../model-error";
import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import type { AnthropicCall } from "./types";

const unreadStream = async (provider: string, response: Response): Promise<StreamEvent[]> => {
  await response.body?.cancel();

  throw new ModelError({
    kind: "unsupported",
    provider,
    retryable: false,
    message: "anthropic does not read the stream yet",
  });
};

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

  yield* await unreadStream(provider, response);
}

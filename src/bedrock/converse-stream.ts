import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import { PROVIDER } from "./constants";
import { readStream } from "./read-stream";
import type { BedrockCall } from "./types";

export async function* converseStream(
  call: BedrockCall,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { signal } = request;

  const response = await post({
    provider: PROVIDER,
    ...buildRequest(call, request),
    fetch: call.fetch,
    signal,
    errorOf: (text) => ({ message: text }),
  });

  try {
    yield* readStream(response.body ?? new Blob().stream());
  } catch (error) {
    if (!signal?.aborted) throw error;

    yield { type: "abort" };
  }
}

import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import { readStream } from "./read-stream";
import type { ResponsesCall } from "./types";

export async function* streamResponses(
  call: ResponsesCall,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { provider, fetch } = call;
  const { signal } = request;

  const response = await post({
    provider,
    ...buildRequest(call, request),
    fetch,
    signal,
    errorOf: (text) => ({ message: text }),
  });

  const declared = new Set(request.tools?.map((tool) => tool.name));

  try {
    yield* readStream(provider, response.body ?? new Blob().stream(), declared);
  } catch (error) {
    if (!signal?.aborted) throw error;

    yield { type: "abort" };
  }
}

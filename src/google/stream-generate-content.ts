import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import { PROVIDER } from "./constants";
import { readStream } from "./read-stream";
import type { GoogleCall } from "./types";

export async function* streamGenerateContent(
  call: GoogleCall,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { signal } = request;
  const declared = new Set(request.tools?.map((tool) => tool.name));

  const response = await post({
    provider: PROVIDER,
    ...buildRequest(call, request),
    fetch: call.fetch,
    signal,
    errorOf: (text) => ({ message: text }),
  });

  try {
    yield* readStream(response.body ?? new Blob().stream(), declared);
  } catch (error) {
    if (!signal?.aborted) throw error;

    yield { type: "abort" };
  }
}

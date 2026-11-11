import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import type { ResponsesCall } from "./types";
import { unsupported } from "./unsupported";

const unreadStream = async (provider: string, response: Response): Promise<StreamEvent[]> => {
  await response.body?.cancel();

  throw unsupported(provider, "openai does not read the stream yet");
};

export async function* streamResponses(
  call: ResponsesCall,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { provider, fetch } = call;

  const response = await post({
    provider,
    ...buildRequest(call, request),
    fetch,
    signal: request.signal,
    errorOf: (text) => ({ message: text }),
  });

  yield* await unreadStream(provider, response);
}

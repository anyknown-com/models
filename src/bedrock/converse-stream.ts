import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { unsupported } from "../wire/unsupported";
import { buildRequest } from "./build-request";
import { PROVIDER } from "./constants";
import type { BedrockCall } from "./types";

const unreadStream = async (response: Response): Promise<StreamEvent[]> => {
  await response.body?.cancel();

  throw unsupported(PROVIDER, "bedrock does not read the stream yet");
};

export async function* converseStream(
  call: BedrockCall,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const response = await post({
    provider: PROVIDER,
    ...buildRequest(call, request),
    fetch: call.fetch,
    signal: request.signal,
    errorOf: (text) => ({ message: text }),
  });

  yield* await unreadStream(response);
}

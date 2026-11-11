import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import { PROVIDER } from "./constants";
import type { GoogleCall } from "./types";
import { unsupported } from "../wire/unsupported";

const unreadStream = async (response: Response): Promise<StreamEvent[]> => {
  await response.body?.cancel();

  throw unsupported(PROVIDER, "google does not read the stream yet");
};

export async function* streamGenerateContent(
  call: GoogleCall,
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

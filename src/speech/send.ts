import { ModelError } from "../model-error";
import { responseFailure } from "./response-failure";
import type { SpeechCall } from "./types";

export async function send(
  call: SpeechCall,
  request: Request,
  signal: AbortSignal | undefined,
): Promise<Response> {
  const { fetch: fetcher } = call;
  let response: Response;

  try {
    response = await fetcher(request, { signal });
  } catch (error) {
    throw new ModelError({
      kind: signal?.aborted ? "abort" : "network",
      provider: call.provider,
      retryable: !signal?.aborted,
      message: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  }

  if (!response.ok) throw await responseFailure(call.provider, response);

  return response;
}

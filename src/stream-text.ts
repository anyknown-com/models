import { toModelError } from "./to-model-error";
import type { StreamEvent } from "./types/stream-event";
import type { TextAdapter } from "./types/text-adapter";
import type { TextRequest } from "./types/text-request";
import type { TokenUsage } from "./types/token-usage";

const NO_USAGE: TokenUsage = { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 };

export async function* streamText(
  adapter: TextAdapter,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { signal } = request;
  let usage = NO_USAGE;
  let aborted = false;
  let failed = false;
  let failure: unknown;

  try {
    signal?.throwIfAborted();

    for await (const event of adapter.stream(request)) {
      yield event;

      if (event.type === "finish") return;
      if (event.type === "abort") aborted = true;
      if (event.type === "step-finish") usage = event.usage;
    }

    signal?.throwIfAborted();
  } catch (error) {
    failed = true;
    failure = error;
  }

  if (!failed) {
    yield { type: "finish", reason: "other", usage };

    return;
  }

  if (signal?.aborted && !aborted) yield { type: "abort" };

  yield {
    type: "finish",
    reason: "error",
    usage,
    error: toModelError(failure, adapter.provider, signal),
  };
}

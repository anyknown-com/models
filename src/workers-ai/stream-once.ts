import { ModelError } from "../model-error";
import { toModelError } from "../to-model-error";
import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { PROVIDER } from "./constants";
import { runWithin } from "./run-within";
import { textInput } from "./text-input";
import { tokenUsageOf } from "./token-usage-of";
import type { WorkersAiBinding } from "./types";

const responseOf = (output: unknown): string => {
  const response =
    typeof output === "object" && output !== null && "response" in output
      ? output.response
      : undefined;

  if (typeof response === "string") return response;

  throw new ModelError({
    kind: "server",
    provider: PROVIDER,
    retryable: false,
    message: "workers ai output has no text response",
  });
};

export async function* streamOnce(
  binding: WorkersAiBinding,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { model, signal } = request;
  let output: unknown;
  let text: string;

  try {
    output = await runWithin(binding, model, textInput(request), signal);
    text = responseOf(output);
  } catch (error) {
    if (signal?.aborted) yield { type: "abort" };

    yield {
      type: "finish",
      reason: "error",
      usage: tokenUsageOf(undefined),
      error: toModelError(error, PROVIDER, signal),
    };

    return;
  }

  if (text.length > 0) {
    yield { type: "text-start", id: "0" };
    yield { type: "text", id: "0", delta: text };
    yield { type: "text-end", id: "0" };
  }

  const usage = tokenUsageOf(output);

  yield { type: "step-finish", reason: "stop", usage, raw: output };
  yield { type: "finish", reason: "stop", usage, raw: output };
}

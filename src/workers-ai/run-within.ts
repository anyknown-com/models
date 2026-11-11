import type { JsonObject } from "../types/json";
import { toModelError } from "./to-model-error";
import type { WorkersAiBinding } from "./types";

export function runWithin(
  binding: WorkersAiBinding,
  model: string,
  input: JsonObject,
  signal?: AbortSignal,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const fail = (error: unknown) => reject(toModelError(error, signal));
    const onAbort = () => fail(signal?.reason);

    if (signal?.aborted) {
      onAbort();

      return;
    }

    signal?.addEventListener("abort", onAbort, { once: true });

    (async () => binding.run(model, input, signal ? { signal } : undefined))()
      .then(resolve, fail)
      .finally(() => signal?.removeEventListener("abort", onAbort));
  });
}

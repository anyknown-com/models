import type { JsonObject } from "../../../src/types/json";
import type { WorkersAiBinding } from "../../../src/workers-ai";

export type RecordedCall = { model: string; input: JsonObject; options?: { signal?: AbortSignal } };

export type FixtureCall = RecordedCall & { output: unknown };

export function recordingBinding(outputs: unknown[]) {
  const received: RecordedCall[] = [];

  const binding: WorkersAiBinding = {
    run: async (model, input, options) => {
      const output = outputs[received.length];

      received.push({ model, input, options });

      return output;
    },
  };

  return { binding, received };
}

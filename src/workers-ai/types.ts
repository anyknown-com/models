import type { JsonObject } from "../types/json";

export interface WorkersAiBinding {
  run(model: string, input: JsonObject, options?: { signal?: AbortSignal }): Promise<unknown>;
}

export type WorkersAiConfig = { binding: WorkersAiBinding };

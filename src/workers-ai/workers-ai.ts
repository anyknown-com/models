import type { EmbedAdapter } from "../types/embed-adapter";
import { PROVIDER } from "./constants";
import { embedBatches } from "./embed-batches";
import type { WorkersAiConfig } from "./types";

export function workersAi({ binding }: WorkersAiConfig): EmbedAdapter {
  return { provider: PROVIDER, embed: (request) => embedBatches(binding, request) };
}

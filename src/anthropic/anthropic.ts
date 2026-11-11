import { defaultFetch } from "../default-fetch";
import type { AdapterConfig } from "../types/adapter-config";
import type { TextAdapter } from "../types/text-adapter";
import { capabilities } from "./capabilities";
import { ANTHROPIC_BASE_URL, PROVIDER } from "./constants";
import { streamMessages } from "./stream-messages";
import type { AnthropicCall } from "./types";

export function anthropic(config: AdapterConfig): TextAdapter {
  const call: AnthropicCall = {
    provider: PROVIDER,
    key: config.key,
    fetch: config.fetch ?? defaultFetch,
    baseUrl: config.baseUrl ?? ANTHROPIC_BASE_URL,
  };

  return {
    provider: call.provider,
    capabilities,
    stream: (request) => streamMessages(call, request),
  };
}

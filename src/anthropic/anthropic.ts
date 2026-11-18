import { defaultFetch } from "../default-fetch";
import type { TextAdapter } from "../types/text-adapter";
import { capabilities } from "./capabilities";
import { ANTHROPIC_BASE_URL, PROVIDER } from "./constants";
import { streamMessages } from "./stream-messages";
import type { AnthropicCall, AnthropicConfig } from "./types";

export function anthropic(config: AnthropicConfig): TextAdapter {
  const call: AnthropicCall = {
    provider: PROVIDER,
    auth: "token" in config ? { token: config.token } : { key: config.key },
    fetch: config.fetch ?? defaultFetch,
    baseUrl: config.baseUrl ?? ANTHROPIC_BASE_URL,
  };

  return {
    provider: call.provider,
    capabilities,
    stream: (request) => streamMessages(call, request),
  };
}

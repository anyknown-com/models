import { defaultFetch } from "../default-fetch";
import type { TextAdapter } from "../types/text-adapter";
import { CHATGPT_BASE_URL } from "./constants";
import { streamChatgpt } from "./stream-chatgpt";
import type { ChatgptCall, ChatgptConfig } from "./types";

export function chatgpt(config: ChatgptConfig): TextAdapter {
  const call: ChatgptCall = {
    provider: "chatgpt",
    key: config.key,
    accountId: config.accountId,
    fetch: config.fetch ?? defaultFetch,
    baseUrl: config.baseUrl ?? CHATGPT_BASE_URL,
  };

  return {
    provider: call.provider,
    capabilities: () => ({ thinking: "none", effortLevels: [] }),
    stream: (request) => streamChatgpt(call, request),
  };
}

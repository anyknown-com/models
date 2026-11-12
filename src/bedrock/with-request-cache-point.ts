import type { ProviderOptions } from "../types/provider-options";
import type { BedrockMessage } from "./types";
import { withCachePoint } from "./with-cache-point";

export function withRequestCachePoint(
  messages: BedrockMessage[],
  providerOptions: ProviderOptions | undefined,
): BedrockMessage[] {
  const last = messages.at(-1);

  if (!last) return messages;

  return [
    ...messages.slice(0, -1),
    { ...last, content: withCachePoint(last.content, providerOptions) },
  ];
}

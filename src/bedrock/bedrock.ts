import { defaultFetch } from "../default-fetch";
import type { TextAdapter } from "../types/text-adapter";
import { PROVIDER } from "./constants";
import { converseStream } from "./converse-stream";
import type { BedrockCall, BedrockConfig } from "./types";

export function bedrock(config: BedrockConfig): TextAdapter {
  const call: BedrockCall = {
    key: config.key.trim(),
    fetch: config.fetch ?? defaultFetch,
    baseUrl: config.baseUrl.replace(/\/$/, ""),
  };

  return {
    provider: PROVIDER,
    capabilities: () => ({ thinking: "none", effortLevels: [] }),
    stream: (request) => converseStream(call, request),
  };
}

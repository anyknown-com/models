import { defaultFetch } from "../default-fetch";
import type { AdapterConfig } from "../types/adapter-config";
import type { TextAdapter } from "../types/text-adapter";
import { GOOGLE_BASE_URL, PROVIDER } from "./constants";
import { streamGenerateContent } from "./stream-generate-content";
import type { GoogleCall } from "./types";

export function google(config: AdapterConfig): TextAdapter {
  const call: GoogleCall = {
    key: config.key,
    fetch: config.fetch ?? defaultFetch,
    baseUrl: (config.baseUrl ?? GOOGLE_BASE_URL).replace(/\/$/, ""),
  };

  return {
    provider: PROVIDER,
    capabilities: () => ({ thinking: "none", effortLevels: [] }),
    stream: (request) => streamGenerateContent(call, request),
  };
}

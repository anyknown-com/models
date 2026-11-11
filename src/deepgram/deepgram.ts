import { defaultFetch } from "../default-fetch";
import type { SpeechCall } from "../speech/types";
import type { AdapterConfig } from "../types/adapter-config";
import type { TranscribeAdapter } from "../types/transcribe-adapter";
import { DEEPGRAM_BASE_URL } from "./constants";
import { transcribe } from "./transcribe";

export function deepgram(config: AdapterConfig): TranscribeAdapter {
  const call: SpeechCall = {
    provider: "deepgram",
    key: config.key,
    fetch: config.fetch ?? defaultFetch,
    baseUrl: config.baseUrl ?? DEEPGRAM_BASE_URL,
  };

  return { provider: call.provider, transcribe: (request) => transcribe(call, request) };
}

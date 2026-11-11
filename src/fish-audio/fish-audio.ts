import { defaultFetch } from "../default-fetch";
import type { SpeechCall } from "../speech/types";
import type { AdapterConfig } from "../types/adapter-config";
import type { SynthesizeAdapter } from "../types/synthesize-adapter";
import type { TranscribeAdapter } from "../types/transcribe-adapter";
import { FISH_AUDIO_BASE_URL } from "./constants";
import { synthesize } from "./synthesize";
import { transcribe } from "./transcribe";

export function fishAudio(config: AdapterConfig): TranscribeAdapter & SynthesizeAdapter {
  const call: SpeechCall = {
    provider: "fish-audio",
    key: config.key,
    fetch: config.fetch ?? defaultFetch,
    baseUrl: config.baseUrl ?? FISH_AUDIO_BASE_URL,
  };

  return {
    provider: call.provider,
    transcribe: (request) => transcribe(call, request),
    synthesize: (request) => synthesize(call, request),
  };
}

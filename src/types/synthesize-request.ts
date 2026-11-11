import type { SpeechUsage } from "./speech-usage";

export type SynthesizeRequest = {
  model: string;
  text: string;
  voice?: string;
  signal?: AbortSignal;
};

export type SynthesizeResult = { audio: Response; usage: SpeechUsage };

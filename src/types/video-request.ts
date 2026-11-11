import type { ProviderOptions } from "./provider-options";
import type { VideoJob } from "./video-job";

export type VideoRequest = {
  model: string;
  prompt: string;
  source?: VideoJob;
  providerOptions?: ProviderOptions;
  signal?: AbortSignal;
};

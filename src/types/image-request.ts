import type { ImagePart } from "./parts";
import type { ProviderOptions } from "./provider-options";

export type ImageRequest = {
  model: string;
  prompt: string;
  images?: ImagePart[];
  providerOptions?: ProviderOptions;
  signal?: AbortSignal;
};

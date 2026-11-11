import type { JsonObject } from "../types/json";
import type { ProviderOptions } from "../types/provider-options";

export function cacheControlOf(providerOptions: ProviderOptions | undefined): JsonObject {
  const anthropic = providerOptions?.anthropic;
  const cacheControl = anthropic?.cacheControl ?? anthropic?.cache_control;

  return cacheControl ? { cache_control: cacheControl } : {};
}

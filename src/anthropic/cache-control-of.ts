import type { JsonObject, JsonValue } from "../types/json";
import type { ProviderOptions } from "../types/provider-options";

const cacheOf = (providerOptions: ProviderOptions | undefined): JsonValue | undefined => {
  const anthropic = providerOptions?.anthropic;

  return anthropic?.cacheControl ?? anthropic?.cache_control;
};

export function cacheControlOf(...candidates: (ProviderOptions | undefined)[]): JsonObject {
  const cacheControl = candidates.map(cacheOf).find(Boolean);

  return cacheControl ? { cache_control: cacheControl } : {};
}

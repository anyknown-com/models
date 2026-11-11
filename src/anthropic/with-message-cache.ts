import type { JsonObject } from "../types/json";
import type { ProviderOptions } from "../types/provider-options";
import { cacheControlOf } from "./cache-control-of";

export function withMessageCache(
  blocksOfParts: JsonObject[][],
  providerOptions: ProviderOptions | undefined,
): JsonObject[] {
  const lastPartBlock = blocksOfParts.at(-1)?.at(-1);
  const cacheControl = cacheControlOf(providerOptions);

  return blocksOfParts
    .flat()
    .map((block) =>
      block === lastPartBlock && !block.cache_control ? { ...block, ...cacheControl } : block,
    );
}

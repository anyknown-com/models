import type { JsonObject } from "../types/json";
import type { ProviderOptions } from "../types/provider-options";

const cachePointOf = (providerOptions: ProviderOptions | undefined) =>
  providerOptions?.bedrock?.cachePoint;

// https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_CachePointBlock.html
export function withCachePoint(
  blocks: JsonObject[],
  ...candidates: (ProviderOptions | undefined)[]
): JsonObject[] {
  const cachePoint = candidates.map(cachePointOf).find(Boolean);
  const last = blocks.at(-1);

  if (!cachePoint || !last || "cachePoint" in last) return blocks;

  return [...blocks, { cachePoint }];
}

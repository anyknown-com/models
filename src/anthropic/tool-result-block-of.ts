import type { JsonObject } from "../types/json";
import type { ToolResultOutput, ToolResultPart } from "../types/parts";
import type { ProviderOptions } from "../types/provider-options";
import { cacheControlOf } from "./cache-control-of";
import { toolResultContentOf } from "./tool-result-content-of";

const outputOptionsOf = (output: ToolResultOutput): ProviderOptions | undefined =>
  output.type === "content" && !output.providerOptions
    ? output.value.find((part) => part.providerOptions)?.providerOptions
    : output.providerOptions;

export function toolResultBlockOf({
  toolCallId,
  output,
  providerOptions,
}: ToolResultPart): JsonObject {
  const isError = output.type === "error-text" || output.type === "error-json";

  return {
    type: "tool_result",
    tool_use_id: toolCallId,
    content: toolResultContentOf(output),
    ...(isError ? { is_error: true } : {}),
    ...cacheControlOf(providerOptions, outputOptionsOf(output)),
  };
}

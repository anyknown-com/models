import type { JsonObject } from "../types/json";
import type { ReasoningPart } from "../types/parts";

export function reasoningBlockOf({ text, providerOptions }: ReasoningPart): JsonObject[] {
  const { signature, redactedData } = providerOptions?.anthropic ?? {};

  if (typeof signature === "string") return [{ type: "thinking", thinking: text, signature }];
  if (typeof redactedData === "string") return [{ type: "redacted_thinking", data: redactedData }];

  return [];
}

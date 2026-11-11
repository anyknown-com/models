import type { JsonObject } from "../types/json";
import type { ReasoningPart } from "../types/parts";

const reasoningContentOf = ({ text, providerOptions }: ReasoningPart): JsonObject | undefined => {
  const { signature, redactedContent, redactedData } =
    providerOptions?.amazonBedrock ?? providerOptions?.bedrock ?? {};

  if (typeof signature === "string") return { reasoningText: { text, signature } };
  if (typeof redactedContent === "string") return { redactedContent };
  if (typeof redactedData === "string") return { redactedReasoning: { data: redactedData } };

  return undefined;
};

export function reasoningBlockOf(part: ReasoningPart): JsonObject[] {
  const reasoningContent = reasoningContentOf(part);

  return reasoningContent ? [{ reasoningContent }] : [];
}

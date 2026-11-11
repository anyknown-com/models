import type { TextRequest } from "../types/text-request";
import { ANTHROPIC_RESPONSE_FIELD_PATHS, MAX_TOKENS_BESIDE_THINKING } from "./constants";
import { isAnthropicModel } from "./is-anthropic-model";
import { thinkingBudgetOf } from "./thinking-budget-of";
import { toMessages } from "./to-messages";
import type { BedrockCall, BedrockRequest } from "./types";

export function buildRequest(call: BedrockCall, request: TextRequest): BedrockRequest {
  const { model, system = [], maxOutputTokens, providerOptions } = request;
  const reasoningConfig = providerOptions?.bedrock?.reasoningConfig;
  const anthropic = isAnthropicModel(model, reasoningConfig);
  const budget = anthropic ? thinkingBudgetOf(reasoningConfig) : undefined;

  const maxTokens =
    budget === undefined
      ? maxOutputTokens
      : (maxOutputTokens ?? MAX_TOKENS_BESIDE_THINKING) + budget;

  return {
    url: `${call.baseUrl}/model/${encodeURIComponent(model)}/converse-stream`,
    headers: { authorization: `Bearer ${call.key}` },
    body: {
      system: system.map(({ text }) => ({ text })),
      messages: toMessages(request.messages),
      ...(budget === undefined
        ? {}
        : {
            additionalModelRequestFields: {
              thinking: { type: "enabled", budget_tokens: budget },
            },
          }),
      ...(anthropic ? { additionalModelResponseFieldPaths: ANTHROPIC_RESPONSE_FIELD_PATHS } : {}),
      ...(maxTokens === undefined ? {} : { inferenceConfig: { maxTokens } }),
    },
  };
}

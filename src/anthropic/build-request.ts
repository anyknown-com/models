import type { TextRequest } from "../types/text-request";
import { ANTHROPIC_VERSION } from "./constants";
import { maxTokensOf } from "./max-tokens-of";
import { textBlockOf } from "./text-block-of";
import { thinkingOf } from "./thinking-of";
import { toMessages } from "./to-messages";
import type { AnthropicCall, AnthropicRequest } from "./types";

export function buildRequest(call: AnthropicCall, request: TextRequest): AnthropicRequest {
  const { model, system = [], providerOptions } = request;
  const { thinking, effort, cacheControl } = providerOptions?.anthropic ?? {};
  const reasoning = thinkingOf(thinking);

  return {
    url: `${call.baseUrl}/messages`,
    headers: { "x-api-key": call.key, "anthropic-version": ANTHROPIC_VERSION },
    body: {
      model,
      max_tokens: maxTokensOf(model, request.maxOutputTokens, reasoning?.budget ?? 0),
      ...(reasoning ? { thinking: reasoning.thinking } : {}),
      ...(effort ? { output_config: { effort } } : {}),
      ...(cacheControl ? { cache_control: cacheControl } : {}),
      ...(system.length > 0 ? { system: system.map(textBlockOf) } : {}),
      messages: toMessages(request.messages),
      stream: true,
    },
  };
}

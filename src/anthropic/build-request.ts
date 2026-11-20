import type { TextRequest } from "../types/text-request";
import { authHeaderOf } from "./auth-header-of";
import { betaHeaderOf } from "./beta-header-of";
import { ANTHROPIC_VERSION } from "./constants";
import { maxTokensOf } from "./max-tokens-of";
import { systemBlocksOf } from "./system-blocks-of";
import { thinkingOf } from "./thinking-of";
import { toMessages } from "./to-messages";
import { toTools } from "./to-tools";
import type { AnthropicCall, AnthropicRequest } from "./types";

export function buildRequest(call: AnthropicCall, request: TextRequest): AnthropicRequest {
  const { model, system = [], tools = [], providerOptions } = request;
  const { thinking, effort, cacheControl } = providerOptions?.anthropic ?? {};
  const reasoning = thinkingOf(thinking);
  const messages = toMessages(request.messages);
  const blocks = systemBlocksOf(call.auth, system);

  return {
    url: `${call.baseUrl}/messages`,
    headers: {
      ...authHeaderOf(call.auth),
      "anthropic-version": ANTHROPIC_VERSION,
      ...betaHeaderOf(call.auth, model, tools, messages),
    },
    body: {
      model,
      max_tokens: maxTokensOf(model, request.maxOutputTokens, reasoning?.budget ?? 0),
      ...(reasoning ? { thinking: reasoning.thinking } : {}),
      ...(effort ? { output_config: { effort } } : {}),
      ...(cacheControl ? { cache_control: cacheControl } : {}),
      ...(blocks.length > 0 ? { system: blocks } : {}),
      messages,
      ...toTools(tools),
      stream: true,
    },
  };
}

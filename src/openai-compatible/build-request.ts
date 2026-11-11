import type { TextRequest } from "../types/text-request";
import { providerFieldsOf } from "./provider-fields-of";
import { toChatMessages } from "./to-chat-messages";
import type { ChatRequest, OpenaiCompatibleConfig } from "./types";

const authHeadersOf = ({ key, authHeader }: OpenaiCompatibleConfig): Record<string, string> => {
  if (!key) return {};

  return authHeader ? { [authHeader]: key } : { authorization: `Bearer ${key}` };
};

export function buildRequest(config: OpenaiCompatibleConfig, request: TextRequest): ChatRequest {
  const { model, maxOutputTokens, providerOptions } = request;

  return {
    url: `${config.baseUrl.replace(/\/$/, "")}/chat/completions`,
    headers: authHeadersOf(config),
    body: {
      model,
      ...(maxOutputTokens === undefined ? {} : { max_tokens: maxOutputTokens }),
      ...providerFieldsOf(providerOptions?.[config.name]),
      messages: toChatMessages(config.name, request),
      stream: true,
    },
  };
}

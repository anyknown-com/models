import { bearerHeaders } from "../speech/bearer-headers";
import type { TextRequest } from "../types/text-request";
import { isReasoningModel } from "./is-reasoning-model";
import { reasoningOf } from "./reasoning-of";
import { toInput } from "./to-input";
import { toTools } from "./to-tools";
import type { ResponsesCall, ResponsesRequest } from "./types";

export function buildRequest(call: ResponsesCall, request: TextRequest): ResponsesRequest {
  const { model, maxOutputTokens, providerOptions } = request;
  const { promptCacheKey, reasoningEffort } = providerOptions?.openai ?? {};

  return {
    url: `${call.baseUrl.replace(/\/$/, "")}/responses`,
    headers: bearerHeaders(call.key),
    body: {
      model,
      input: toInput(call.provider, request),
      ...(maxOutputTokens === undefined ? {} : { max_output_tokens: maxOutputTokens }),
      ...(promptCacheKey === undefined ? {} : { prompt_cache_key: promptCacheKey }),
      ...(isReasoningModel(model) ? reasoningOf(reasoningEffort) : {}),
      ...toTools(request.tools),
      stream: true,
    },
  };
}

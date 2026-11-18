import { reasoningOf } from "../openai/reasoning-of";
import { toInput } from "../openai/to-input";
import { toTools } from "../openai/to-tools";
import type { ResponsesRequest } from "../openai/types";
import { bearerHeaders } from "../speech/bearer-headers";
import type { TextRequest } from "../types/text-request";
import { CODEX_HEADERS } from "./constants";
import { instructionsOf } from "./instructions-of";
import type { ChatgptCall } from "./types";

export function buildRequest(call: ChatgptCall, request: TextRequest): ResponsesRequest {
  const { model, system, providerOptions } = request;
  const { promptCacheKey, reasoningEffort } = providerOptions?.chatgpt ?? {};

  return {
    url: `${call.baseUrl.replace(/\/$/, "")}/responses`,
    headers: {
      ...bearerHeaders(call.key),
      "chatgpt-account-id": call.accountId,
      ...CODEX_HEADERS,
    },
    body: {
      model,
      input: [...instructionsOf(system), ...toInput(call.provider, { ...request, system: [] })],
      ...(promptCacheKey === undefined ? {} : { prompt_cache_key: promptCacheKey }),
      ...reasoningOf(reasoningEffort),
      ...toTools(request.tools),
      store: false,
      stream: true,
    },
  };
}

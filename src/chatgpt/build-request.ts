import { reasoningOf } from "../openai/reasoning-of";
import { toInput } from "../openai/to-input";
import { toTools } from "../openai/to-tools";
import type { ResponsesRequest } from "../openai/types";
import { bearerHeaders } from "../speech/bearer-headers";
import type { TextRequest } from "../types/text-request";
import { ACCOUNT_HEADER } from "./constants";
import type { ChatgptCall } from "./types";

export function buildRequest(call: ChatgptCall, request: TextRequest): ResponsesRequest {
  const { model, system = [], providerOptions } = request;
  const { promptCacheKey, reasoningEffort } = providerOptions?.chatgpt ?? {};
  const instructions = system.map(({ text }) => text).join("\n\n");

  return {
    url: `${call.baseUrl.replace(/\/$/, "")}/responses`,
    headers: { ...bearerHeaders(call.key), [ACCOUNT_HEADER]: call.accountId },
    body: {
      model,
      ...(instructions === "" ? {} : { instructions }),
      input: toInput(call.provider, { ...request, system: [] }),
      ...(promptCacheKey === undefined ? {} : { prompt_cache_key: promptCacheKey }),
      ...reasoningOf(reasoningEffort),
      ...toTools(request.tools),
      store: false,
      stream: true,
    },
  };
}

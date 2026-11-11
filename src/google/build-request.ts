import type { TextRequest } from "../types/text-request";
import { generationConfigOf } from "./generation-config-of";
import { modelPathOf } from "./model-path-of";
import { toContents } from "./to-contents";
import { toTools } from "./to-tools";
import type { GoogleCall, GoogleRequest } from "./types";

export function buildRequest(call: GoogleCall, request: TextRequest): GoogleRequest {
  const { model, maxOutputTokens, providerOptions } = request;

  return {
    url: `${call.baseUrl}/${modelPathOf(model)}:streamGenerateContent?alt=sse`,
    headers: { "x-goog-api-key": call.key },
    body: {
      generationConfig: generationConfigOf(maxOutputTokens, providerOptions?.google),
      ...toContents(request),
      ...toTools(request.tools),
    },
  };
}

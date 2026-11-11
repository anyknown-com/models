import { modelErrorOf } from "../openai-compatible/model-error-of";
import { readJson } from "../speech/read-json";
import type { SpeechCall } from "../speech/types";
import type { ImageRequest } from "../types/image-request";
import type { ImageResult } from "../types/image-result";
import { post } from "../wire/post";
import { imageRequestOf } from "./image-request-of";
import { imageResultOf } from "./image-result-of";

export async function generateImage(call: SpeechCall, request: ImageRequest): Promise<ImageResult> {
  const response = await post({
    provider: call.provider,
    ...imageRequestOf(call, request),
    fetch: call.fetch,
    signal: request.signal,
    errorOf: modelErrorOf,
  });

  return imageResultOf(call.provider, await readJson(call.provider, response));
}

import { bearerHeaders } from "../speech/bearer-headers";
import type { SpeechCall } from "../speech/types";
import type { ImageRequest } from "../types/image-request";
import type { JsonObject } from "../types/json";
import { IMAGE_QUALITY, IMAGE_SIZE } from "./constants";
import { imageInputOf } from "./image-input-of";

type ImageHttpRequest = { url: string; headers: Record<string, string>; body: JsonObject };

export function imageRequestOf(call: SpeechCall, request: ImageRequest): ImageHttpRequest {
  const { model, prompt, images = [], providerOptions } = request;
  const { quality = IMAGE_QUALITY, size = IMAGE_SIZE } = providerOptions?.openai ?? {};
  const edits = images.length > 0;

  return {
    url: `${call.baseUrl.replace(/\/$/, "")}/images/${edits ? "edits" : "generations"}`,
    headers: bearerHeaders(call.key),
    body: {
      model,
      prompt,
      ...(edits ? { images: images.map((part) => imageInputOf(call.provider, part)) } : {}),
      quality,
      size,
      n: 1,
    },
  };
}

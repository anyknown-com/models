import { ModelError } from "../model-error";
import { fieldOf } from "../speech/field-of";
import type { ImageResult } from "../types/image-result";
import { bytesOfBase64 } from "../wire/base64";

const imageOf = (b64: unknown, url: unknown): Uint8Array | URL | undefined => {
  if (typeof b64 === "string") return bytesOfBase64(b64);

  return typeof url === "string" ? new URL(url) : undefined;
};

export function imageResultOf(provider: string, body: unknown): ImageResult {
  const data = fieldOf(body, "data");
  const first: unknown = Array.isArray(data) ? data[0] : undefined;
  const image = imageOf(fieldOf(first, "b64_json"), fieldOf(first, "url"));
  const format = fieldOf(body, "output_format");

  if (image === undefined) {
    throw new ModelError({
      kind: "server",
      provider,
      retryable: false,
      message: "openai returned no image",
      body: JSON.stringify(body),
    });
  }

  return {
    image,
    ...(typeof format === "string" ? { mediaType: `image/${format}` } : {}),
    usage: { amount: Array.isArray(data) ? data.length : null, unit: "images" },
    raw: body,
  };
}

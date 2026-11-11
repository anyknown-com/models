import type { JsonObject } from "../types/json";
import { base64Of } from "../wire/base64";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { sendableHrefOf } from "../wire/sendable-href-of";
import { unsupported } from "../wire/unsupported";

const hasSubtype = (mediaType: string) => /^[^/]+\/[^*]/.test(mediaType);

export function imageUrlPartOf(
  provider: string,
  data: Uint8Array | URL,
  mediaType: string,
): JsonObject {
  if (data instanceof URL) {
    return { type: "image_url", image_url: { url: sendableHrefOf(provider, data) } };
  }

  const fullType = imageMediaTypeOf(data) ?? mediaType;

  if (!hasSubtype(fullType))
    throw unsupported(provider, `image media type ${fullType} has no subtype`);

  return { type: "image_url", image_url: { url: `data:${fullType};base64,${base64Of(data)}` } };
}

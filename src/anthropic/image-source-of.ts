import type { JsonObject } from "../types/json";
import { base64Of } from "../wire/base64";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

const hasSubtype = (mediaType: string): boolean => /^[^/]+\/[^*]/.test(mediaType);

export function imageSourceOf(bytes: Uint8Array, mediaType: string): JsonObject {
  const fullType = imageMediaTypeOf(bytes) ?? mediaType;

  if (!hasSubtype(fullType))
    throw unsupported(PROVIDER, `anthropic does not send images of media type ${fullType}`);

  return { type: "base64", media_type: fullType, data: base64Of(bytes) };
}

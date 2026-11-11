import type { JsonObject } from "../types/json";
import { base64Of } from "../wire/base64";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { unsupported } from "./unsupported";

const hasSubtype = (mediaType: string): boolean => /^[^/]+\/[^*]/.test(mediaType);

export function imageSourceOf(bytes: Uint8Array, mediaType: string): JsonObject {
  const fullType = imageMediaTypeOf(bytes) ?? mediaType;

  if (!hasSubtype(fullType)) throw unsupported(`images of media type ${fullType}`);

  return { type: "base64", media_type: fullType, data: base64Of(bytes) };
}

import type { JsonObject } from "../types/json";
import type { ImagePart } from "../types/parts";
import { base64Of } from "../wire/base64";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { unsupported } from "../wire/unsupported";

const hasSubtype = (mediaType: string): boolean => /^[^/]+\/[^*]/.test(mediaType);

export function imageInputOf(provider: string, part: ImagePart): JsonObject {
  const { image } = part;

  if (image instanceof URL) return { image_url: image.href };

  const mediaType = imageMediaTypeOf(image) ?? part.mediaType;

  if (mediaType === undefined || !hasSubtype(mediaType)) {
    throw unsupported(provider, `openai cannot edit an image of media type ${mediaType}`);
  }

  return { image_url: `data:${mediaType};base64,${base64Of(image)}` };
}

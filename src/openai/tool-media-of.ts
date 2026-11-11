import type { FilePart, ImagePart } from "../types/parts";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { hasSubtype } from "./has-subtype";
import { sourceOf } from "./source-of";
import type { Media } from "./types";

export function toolMediaOf(part: ImagePart | FilePart): Media {
  const { data, mediaType, filename = "data" } = sourceOf(part);

  if (data instanceof URL || hasSubtype(mediaType)) return { data, mediaType, filename };

  return { data, mediaType: imageMediaTypeOf(data) ?? mediaType, filename };
}

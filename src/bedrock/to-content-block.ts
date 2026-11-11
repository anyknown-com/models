import type { JsonObject } from "../types/json";
import { base64Of } from "../wire/base64";
import { DOCUMENT_FORMATS, IMAGE_FORMATS, VIDEO_FORMATS } from "./constants";
import { formatOf } from "./format-of";
import { fullMediaTypeOf } from "./full-media-type-of";
import type { Media, MessageContext } from "./types";

export function toContentBlock(media: Media, { documentName }: MessageContext): JsonObject {
  const mediaType = fullMediaTypeOf(media);
  const source = { bytes: base64Of(media.bytes) };

  switch (mediaType.split("/")[0]) {
    case "image":
      return { image: { format: formatOf(IMAGE_FORMATS, mediaType), source } };
    case "video":
      return { video: { format: formatOf(VIDEO_FORMATS, mediaType), source } };
    default: {
      const format = formatOf(DOCUMENT_FORMATS, mediaType);

      return { document: { format, name: documentName(media.filename), source } };
    }
  }
}

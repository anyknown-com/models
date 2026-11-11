import type { JsonObject } from "../types/json";
import { base64Of } from "../wire/base64";
import { PDF_MEDIA_TYPE } from "./constants";
import { imageSourceOf } from "./image-source-of";
import type { Media } from "./types";
import { urlSourceOf } from "./url-source-of";

const isImage = (mediaType: string): boolean => mediaType.split("/")[0] === "image";

export function toContentBlock({ data, mediaType }: Media): JsonObject | undefined {
  if (isImage(mediaType)) {
    const source = data instanceof URL ? urlSourceOf(data) : imageSourceOf(data, mediaType);

    return { type: "image", source };
  }

  if (mediaType !== PDF_MEDIA_TYPE) return undefined;

  const source =
    data instanceof URL
      ? urlSourceOf(data)
      : { type: "base64", media_type: PDF_MEDIA_TYPE, data: base64Of(data) };

  return { type: "document", source };
}

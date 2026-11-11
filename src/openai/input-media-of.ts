import type { JsonObject } from "../types/json";
import { base64Of } from "../wire/base64";
import { hasSubtype } from "./has-subtype";
import { isImage } from "./is-image";
import type { Media } from "./types";
import { unsupported } from "./unsupported";

export function inputMediaOf(provider: string, { data, mediaType, filename }: Media): JsonObject {
  if (data instanceof URL) {
    return isImage(mediaType)
      ? { type: "input_image", image_url: data.href }
      : { type: "input_file", file_url: data.href };
  }

  if (!hasSubtype(mediaType)) throw unsupported(provider, `media type ${mediaType} has no subtype`);

  const dataUrl = `data:${mediaType};base64,${base64Of(data)}`;

  if (isImage(mediaType)) return { type: "input_image", image_url: dataUrl };

  return { type: "input_file", filename, file_data: dataUrl };
}

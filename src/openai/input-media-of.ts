import type { JsonObject } from "../types/json";
import { base64Of } from "../wire/base64";
import { hasSubtype } from "./has-subtype";
import { isImage } from "./is-image";
import type { Media } from "./types";
import { sendableHrefOf } from "../wire/sendable-href-of";
import { unsupported } from "../wire/unsupported";

export function inputMediaOf(provider: string, { data, mediaType, filename }: Media): JsonObject {
  if (data instanceof URL) {
    const href = sendableHrefOf(provider, data);

    return isImage(mediaType)
      ? { type: "input_image", image_url: href }
      : { type: "input_file", file_url: href };
  }

  if (!hasSubtype(mediaType)) throw unsupported(provider, `media type ${mediaType} has no subtype`);

  const dataUrl = `data:${mediaType};base64,${base64Of(data)}`;

  if (isImage(mediaType)) return { type: "input_image", image_url: dataUrl };

  return { type: "input_file", filename, file_data: dataUrl };
}

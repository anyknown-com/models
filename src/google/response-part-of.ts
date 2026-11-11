import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart, TextPart } from "../types/parts";
import { inlineDataOf } from "./inline-data-of";
import { toolMediaOf } from "./tool-media-of";
import { urlTextOf } from "./url-text-of";

const BASE64_DATA_URL = /^data:([^;,]+);base64,(.+)$/s;

export function responsePartOf(item: TextPart | ImagePart | FilePart): string | JsonObject {
  if (item.type === "text") return item.text;

  const media = toolMediaOf(item);

  if (media.data instanceof Uint8Array) return inlineDataOf(media.data, media.mediaType);

  const [, mimeType, data] = BASE64_DATA_URL.exec(media.data.href) ?? [];

  if (mimeType === undefined || data === undefined) return urlTextOf(media.data, media);

  return { inlineData: { mimeType, data } };
}

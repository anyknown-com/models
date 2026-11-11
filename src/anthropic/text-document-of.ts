import type { JsonObject } from "../types/json";
import { TEXT_MEDIA_TYPE } from "./constants";
import type { Media } from "./types";

export function textDocumentOf({ data, mediaType }: Media): JsonObject | undefined {
  if (mediaType !== TEXT_MEDIA_TYPE || data instanceof URL) return undefined;

  const text = new TextDecoder().decode(data);

  return { type: "document", source: { type: "text", media_type: TEXT_MEDIA_TYPE, data: text } };
}

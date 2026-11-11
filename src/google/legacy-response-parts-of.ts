import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart, TextPart, ToolResultPart } from "../types/parts";
import { functionResponseOf } from "./function-response-of";
import { inlineDataOf } from "./inline-data-of";
import { toolMediaOf } from "./tool-media-of";
import { urlTextOf } from "./url-text-of";

export function legacyResponsePartsOf(
  part: ToolResultPart,
  item: TextPart | ImagePart | FilePart,
): JsonObject[] {
  if (item.type === "text") return [functionResponseOf(part, item.text)];

  const media = toolMediaOf(item);

  if (media.data instanceof URL) return [{ text: urlTextOf(media.data, media) }];

  const kind = media.mediaType.split("/")[0] === "image" ? "image" : "file";

  return [
    inlineDataOf(media.data, media.mediaType),
    { text: `Tool executed successfully and returned this ${kind} as a response` },
  ];
}

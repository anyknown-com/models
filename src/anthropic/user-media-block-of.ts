import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart } from "../types/parts";
import { cacheControlOf } from "./cache-control-of";
import { mediaOf } from "./media-of";
import { textDocumentOf } from "./text-document-of";
import { toContentBlock } from "./to-content-block";
import { unsupported } from "./unsupported";

export function userMediaBlockOf(part: ImagePart | FilePart): JsonObject {
  const media = mediaOf(part);
  const block = toContentBlock(media) ?? textDocumentOf(media);

  if (!block) throw unsupported(`${media.mediaType} files`);

  const title = part.type === "file" && block.type === "document" ? part.filename : undefined;

  return {
    ...block,
    ...(title === undefined ? {} : { title }),
    ...cacheControlOf(part.providerOptions),
  };
}

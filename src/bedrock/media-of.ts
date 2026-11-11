import type { FilePart, ImagePart } from "../types/parts";
import { bytesOf } from "../wire/bytes-of";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { sendableHrefOf } from "../wire/sendable-href-of";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";
import type { Media } from "./types";

export function mediaOf(part: ImagePart | FilePart, sniffsImage: boolean): Media {
  const declared = part.type === "image" ? (part.mediaType ?? "image") : part.mediaType;
  const read = bytesOf(part.type === "image" ? part.image : part.data);

  if ("url" in read) {
    throw unsupported(PROVIDER, `bedrock does not download ${sendableHrefOf(PROVIDER, read.url)}`);
  }

  const sniffed = sniffsImage ? imageMediaTypeOf(read.bytes) : undefined;
  const filename = part.type === "file" ? part.filename : undefined;

  return { bytes: read.bytes, mediaType: sniffed ?? read.mediaType ?? declared, filename };
}

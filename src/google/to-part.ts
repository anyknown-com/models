import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart } from "../types/parts";
import { bytesOf } from "../wire/bytes-of";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { sendableHrefOf } from "../wire/sendable-href-of";
import { PROVIDER } from "./constants";
import { fullMediaTypeOf } from "./full-media-type-of";
import { inlineDataOf } from "./inline-data-of";

const fileDataOf = (url: URL, mediaType: string): JsonObject => ({
  fileData: { mimeType: fullMediaTypeOf(mediaType), fileUri: sendableHrefOf(PROVIDER, url) },
});

export function toPart(part: ImagePart | FilePart): JsonObject {
  const declared = part.type === "image" ? (part.mediaType ?? "image") : part.mediaType;
  const read = bytesOf(part.type === "image" ? part.image : part.data);

  if ("url" in read) return fileDataOf(read.url, declared);

  return inlineDataOf(read.bytes, imageMediaTypeOf(read.bytes) ?? read.mediaType ?? declared);
}

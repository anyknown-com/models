import type { FilePart, ImagePart } from "../types/parts";
import { bytesOf } from "../wire/bytes-of";
import type { Media } from "./types";

export function mediaOf(part: ImagePart | FilePart): Media {
  const data = part.type === "image" ? part.image : part.data;
  const mediaType = part.type === "image" ? (part.mediaType ?? "image") : part.mediaType;
  const read = bytesOf(data);

  if ("url" in read) return { data: read.url, mediaType };

  return { data: read.bytes, mediaType: read.mediaType ?? mediaType };
}

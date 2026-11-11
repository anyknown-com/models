import type { FilePart, ImagePart } from "../types/parts";

type Source = { data: Uint8Array | URL; mediaType: string; filename?: string };

export const sourceOf = (part: ImagePart | FilePart): Source =>
  part.type === "image"
    ? { data: part.image, mediaType: part.mediaType ?? "image" }
    : { data: part.data, mediaType: part.mediaType, filename: part.filename };

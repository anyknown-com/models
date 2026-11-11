import type { FilePart, ImagePart } from "../types/parts";
import { bytesOf } from "../wire/bytes-of";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { isImage } from "./is-image";
import { sourceOf } from "./source-of";
import type { Media } from "./types";
import { unsupported } from "./unsupported";

const PDF = "application/pdf";

type Placement = { index: number; passThrough: boolean };

export function userMediaOf(
  provider: string,
  part: ImagePart | FilePart,
  { index, passThrough }: Placement,
): Media {
  const source = sourceOf(part);
  const read = bytesOf(source.data);

  if ("url" in read) return { ...source, data: read.url, filename: "" };

  const mediaType = imageMediaTypeOf(read.bytes) ?? read.mediaType ?? source.mediaType;

  if (!isImage(mediaType) && mediaType !== PDF && !passThrough) {
    throw unsupported(provider, `file part media type ${mediaType}`);
  }

  const filename = source.filename ?? (mediaType === PDF ? `part-${index}.pdf` : `part-${index}`);

  return { data: read.bytes, mediaType, filename };
}

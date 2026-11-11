import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart } from "../types/parts";
import { base64Of } from "../wire/base64";
import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { imageUrlPartOf } from "./image-url-part-of";
import { unsupported } from "./unsupported";

const PDF = "application/pdf";

const fileDataOf = (provider: string, data: Uint8Array | URL): string => {
  if (!(data instanceof URL)) return `data:${PDF};base64,${base64Of(data)}`;
  if (data.protocol === "data:") return data.href;

  throw unsupported(provider, "PDF file parts with URLs are not supported");
};

export function toContentPart(provider: string, part: ImagePart | FilePart): JsonObject {
  if (part.type === "image") return imageUrlPartOf(provider, part.image, part.mediaType ?? "image");

  const { data, filename = "document.pdf" } = part;
  const mediaType = (data instanceof URL ? undefined : imageMediaTypeOf(data)) ?? part.mediaType;

  if (mediaType.split("/")[0] === "image") return imageUrlPartOf(provider, data, mediaType);
  if (mediaType !== PDF) throw unsupported(provider, `file part media type ${mediaType}`);

  return { type: "file", file: { filename, file_data: fileDataOf(provider, data) } };
}

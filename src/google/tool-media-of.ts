import type { FilePart, ImagePart } from "../types/parts";
import type { ToolMedia } from "./types";

export function toolMediaOf(part: ImagePart | FilePart): ToolMedia {
  if (part.type === "file") {
    const { data, mediaType, providerOptions } = part;

    return { data, mediaType, providerOptions };
  }

  const { image, mediaType = "image", providerOptions } = part;

  return { data: image, mediaType: image instanceof URL ? "image" : mediaType, providerOptions };
}

import { imageMediaTypeOf } from "../wire/image-media-type-of";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

const isFull = (mediaType: string): boolean => {
  const slash = mediaType.indexOf("/");

  return slash !== -1 && !["", "*"].includes(mediaType.slice(slash + 1));
};

export function fullMediaTypeOf(mediaType: string, bytes?: Uint8Array): string {
  if (isFull(mediaType)) return mediaType;

  const isImage = mediaType.split("/")[0] === "image";
  const sniffed = bytes && isImage ? imageMediaTypeOf(bytes) : undefined;

  if (sniffed === undefined) {
    throw unsupported(PROVIDER, `google needs a full media type, got ${mediaType}`);
  }

  return sniffed;
}

import { unsupported } from "../wire/unsupported";
import { PROVIDER, SIGNATURES_BY_TOP_LEVEL } from "./constants";
import { signatureMediaTypeOf } from "./signature-media-type-of";
import type { Media } from "./types";

const isFull = (mediaType: string): boolean => {
  const slash = mediaType.indexOf("/");

  return slash !== -1 && !["", "*"].includes(mediaType.slice(slash + 1));
};

export function fullMediaTypeOf({ bytes, mediaType }: Media): string {
  if (isFull(mediaType)) return mediaType;

  const signatures = SIGNATURES_BY_TOP_LEVEL[mediaType.split("/")[0]];
  const detected = signatures && signatureMediaTypeOf(bytes, signatures);

  if (detected === undefined) {
    throw unsupported(PROVIDER, `bedrock needs a full media type, got ${mediaType}`);
  }

  return detected;
}

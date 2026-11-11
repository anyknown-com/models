import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart, TextPart } from "../types/parts";
import { base64Of } from "../wire/base64";
import { sendableHrefOf } from "../wire/sendable-href-of";

const dataOf = (provider: string, data: Uint8Array | URL): JsonObject =>
  data instanceof URL
    ? { type: "url", url: sendableHrefOf(provider, data) }
    : { type: "data", data: base64Of(data) };

export function toolContentPartOf(
  provider: string,
  part: TextPart | ImagePart | FilePart,
): JsonObject {
  if (part.type === "text") return part;

  const providerOptions: JsonObject = part.providerOptions
    ? { providerOptions: part.providerOptions }
    : {};

  if (part.type === "image") {
    const mediaType = part.image instanceof URL ? "image" : (part.mediaType ?? "image");

    return { type: "file", data: dataOf(provider, part.image), mediaType, ...providerOptions };
  }

  const filename: JsonObject =
    part.filename && !(part.data instanceof URL) ? { filename: part.filename } : {};

  return {
    type: "file",
    data: dataOf(provider, part.data),
    ...filename,
    mediaType: part.mediaType,
    ...providerOptions,
  };
}

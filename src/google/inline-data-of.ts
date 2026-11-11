import type { JsonObject } from "../types/json";
import { base64Of } from "../wire/base64";
import { fullMediaTypeOf } from "./full-media-type-of";

export const inlineDataOf = (bytes: Uint8Array, mediaType: string): JsonObject => ({
  inlineData: { mimeType: fullMediaTypeOf(mediaType, bytes), data: base64Of(bytes) },
});

import { MEDIA_KEPT, MEDIA_MIN } from "./constants.mjs";

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

const isMedia = (text) => text.length >= MEDIA_MIN && BASE64.test(text);

export function shortMedia(value) {
  if (typeof value === "string") return isMedia(value) ? value.slice(0, MEDIA_KEPT) : value;
  if (Array.isArray(value)) return value.map(shortMedia);
  if (value === null || typeof value !== "object") return value;

  return Object.fromEntries(Object.entries(value).map(([key, field]) => [key, shortMedia(field)]));
}

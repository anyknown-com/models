import type { JsonObject } from "../types/json";
import { unsupported } from "./unsupported";

export function urlSourceOf(url: URL): JsonObject {
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw unsupported(`${url.protocol} urls`);

  return { type: "url", url: url.href };
}

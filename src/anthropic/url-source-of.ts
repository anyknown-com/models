import type { JsonObject } from "../types/json";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

export function urlSourceOf(url: URL): JsonObject {
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw unsupported(PROVIDER, `anthropic does not send ${url.protocol} urls`);

  return { type: "url", url: url.href };
}

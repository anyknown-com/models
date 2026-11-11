import type { JsonObject } from "../types/json";
import { sendableHrefOf } from "../wire/sendable-href-of";
import { PROVIDER } from "./constants";

export function urlSourceOf(url: URL): JsonObject {
  return { type: "url", url: sendableHrefOf(PROVIDER, url) };
}

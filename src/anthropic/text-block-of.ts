import type { JsonObject } from "../types/json";
import type { TextPart } from "../types/parts";
import { cacheControlOf } from "./cache-control-of";

export const textBlockOf = ({ text, providerOptions }: TextPart): JsonObject => ({
  type: "text",
  text,
  ...cacheControlOf(providerOptions),
});

import type { JsonObject } from "../../types/json";
import { isJsonObject } from "../../wire/is-json-object";

export function isEmptyObjectSchema({
  type,
  properties,
  additionalProperties,
}: JsonObject): boolean {
  const empty =
    properties === undefined ||
    properties === null ||
    (isJsonObject(properties) && Object.keys(properties).length === 0);

  return type === "object" && empty && !additionalProperties;
}

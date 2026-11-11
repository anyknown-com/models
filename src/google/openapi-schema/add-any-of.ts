import type { JsonObject, JsonValue } from "../../types/json";
import { isJsonObject } from "../../wire/is-json-object";
import type { ChildOf } from "./types";

const isNullSchema = (schema: JsonValue): boolean => isJsonObject(schema) && schema.type === "null";

export function addAnyOf(result: JsonObject, anyOf: JsonValue[], childOf: ChildOf) {
  const rest = anyOf.filter((schema) => !isNullSchema(schema));
  const [only] = rest;

  if (rest.length === anyOf.length) {
    result.anyOf = anyOf.map(childOf);

    return;
  }

  if (rest.length !== 1 || only === undefined) {
    result.anyOf = rest.map(childOf);
    result.nullable = true;

    return;
  }

  const converted = childOf(only);

  if (!isJsonObject(converted)) return;

  result.nullable = true;
  Object.assign(result, converted);
}

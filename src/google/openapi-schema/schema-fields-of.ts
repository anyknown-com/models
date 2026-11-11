import type { JsonObject, JsonValue } from "../../types/json";
import { isJsonObject } from "../../wire/is-json-object";
import { addAnyOf } from "./add-any-of";
import { addEnum } from "./add-enum";
import { addType } from "./add-type";
import type { ChildOf } from "./types";

const listOf = (value: JsonValue | undefined): JsonValue[] | undefined =>
  Array.isArray(value) ? value : undefined;

export function schemaFieldsOf(schema: JsonObject, childOf: ChildOf): JsonObject {
  const { type, description, required, format, properties, items, minLength } = schema;
  const values = listOf(schema.enum) ?? (schema.const === undefined ? undefined : [schema.const]);
  const [allOf, anyOf, oneOf] = [listOf(schema.allOf), listOf(schema.anyOf), listOf(schema.oneOf)];

  const result: JsonObject = {
    ...(description ? { description } : {}),
    ...(required ? { required } : {}),
    ...(format ? { format } : {}),
  };

  addType(result, type);

  if (values) addEnum(result, values, type);

  if (isJsonObject(properties)) {
    result.properties = Object.fromEntries(
      Object.entries(properties).map(([key, value]) => [key, childOf(value)]),
    );
  }

  if (items) result.items = Array.isArray(items) ? items.map(childOf) : childOf(items);

  if (allOf) result.allOf = allOf.map(childOf);

  if (anyOf) addAnyOf(result, anyOf, childOf);

  if (oneOf) result.oneOf = oneOf.map(childOf);

  if (minLength !== undefined) result.minLength = minLength;

  return result;
}

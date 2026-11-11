import type { JsonObject, JsonValue } from "../../types/json";
import { isJsonObject } from "../../wire/is-json-object";
import { openapiSchemaOf } from "./openapi-schema-of";

const definitionsOf = (value: JsonValue | undefined): JsonObject | undefined =>
  value !== undefined && isJsonObject(value) ? value : undefined;

export function toOpenapiSchema(schema: JsonObject): JsonValue | undefined {
  return openapiSchemaOf(schema, true, {
    definitions: definitionsOf(schema.definitions),
    dollarDefinitions: definitionsOf(schema.$defs),
    resolving: new Set(),
  });
}

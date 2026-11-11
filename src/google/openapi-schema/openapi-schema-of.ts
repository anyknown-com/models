import type { JsonObject, JsonValue } from "../../types/json";
import { isJsonObject } from "../../wire/is-json-object";
import { isEmptyObjectSchema } from "./is-empty-object-schema";
import { resolvedReferenceOf } from "./resolved-reference-of";
import { schemaFieldsOf } from "./schema-fields-of";
import type { SchemaContext } from "./types";

const emptyObjectOf = ({ description }: JsonObject): JsonObject =>
  description ? { type: "object", description } : { type: "object" };

export function openapiSchemaOf(
  value: JsonValue | undefined,
  root: boolean,
  context: SchemaContext,
): JsonValue | undefined {
  if (value === undefined || value === null) return undefined;

  const schema = isJsonObject(value) ? value : {};

  if (typeof value === "boolean") return { type: "boolean", properties: {} };

  if (schema.$ref !== undefined && schema.$ref !== null) {
    const resolved = resolvedReferenceOf(schema, context);

    return openapiSchemaOf(resolved.schema, root, resolved.context);
  }

  if (isEmptyObjectSchema(schema)) return root ? undefined : emptyObjectOf(schema);

  return schemaFieldsOf(schema, (child) => openapiSchemaOf(child, false, context) ?? null);
}

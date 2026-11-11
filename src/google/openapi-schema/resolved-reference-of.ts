import type { JsonObject, JsonValue } from "../../types/json";
import { isJsonObject } from "../../wire/is-json-object";
import { unsupported } from "../unsupported";
import { RecursiveReference } from "./recursive-reference";
import { referencedDefinitionOf } from "./referenced-definition-of";
import type { SchemaContext } from "./types";

const mergedOf = (definition: JsonValue, sibling: JsonObject): JsonValue => {
  if (typeof definition === "boolean") return definition && sibling;

  return isJsonObject(definition) ? { ...definition, ...sibling } : sibling;
};

export function resolvedReferenceOf(
  schema: JsonObject,
  context: SchemaContext,
): { schema: JsonValue; context: SchemaContext } {
  const { $ref: reference, ...sibling } = schema;

  if (typeof reference !== "string") throw unsupported("google only converts string $ref values");

  const { definition, key } = referencedDefinitionOf(reference, context);

  if (context.resolving.has(key)) throw new RecursiveReference(reference);

  return {
    schema: mergedOf(definition, sibling),
    context: { ...context, resolving: new Set([...context.resolving, key]) },
  };
}

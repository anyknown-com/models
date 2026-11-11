import type { JsonObject, JsonValue } from "../../types/json";

export type SchemaContext = {
  definitions?: JsonObject;
  dollarDefinitions?: JsonObject;
  resolving: ReadonlySet<string>;
};

export type ChildOf = (schema: JsonValue) => JsonValue;

export type EnumType = "string" | "number" | "integer" | "boolean";

import type { JsonObject, JsonValue } from "../../types/json";
import { unsupported } from "../../wire/unsupported";
import { PROVIDER } from "../constants";
import { enumTypeOf } from "./enum-type-of";

const allowsNull = (type: JsonValue | undefined): boolean =>
  type === undefined || type === "null" || (Array.isArray(type) && type.includes("null"));

export function addEnum(result: JsonObject, values: JsonValue[], type: JsonValue | undefined) {
  const nullable =
    (Array.isArray(type) && type.includes("null")) || (type === undefined && values.includes(null));

  const kept = nullable ? values.filter((value) => value !== null) : values;
  const onlyNull = values.length > 0 && values.every((value) => value === null);
  const enumType = enumTypeOf(kept, type);

  if (Array.isArray(type)) delete result.anyOf;

  if (onlyNull && allowsNull(type)) {
    result.type = "null";

    return;
  }

  if (!enumType) {
    throw unsupported(
      PROVIDER,
      "google only takes a JSON Schema enum whose values share one primitive type",
    );
  }

  result.type = enumType;

  if (nullable) result.nullable = true;

  if (enumType !== "string") result.format = "enum";

  result.enum = enumType === "string" ? kept : kept.map(String);
}

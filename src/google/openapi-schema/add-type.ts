import type { JsonObject, JsonValue } from "../../types/json";

export function addType(result: JsonObject, type: JsonValue | undefined) {
  if (!Array.isArray(type)) {
    if (type) result.type = type;

    return;
  }

  const types = type.filter((each) => each !== "null");

  if (types.length === 0) {
    result.type = "null";

    return;
  }

  result.anyOf = types.map((each) => ({ type: each }));

  if (types.length < type.length) result.nullable = true;
}

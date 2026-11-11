import type { JsonValue } from "../../types/json";
import type { EnumType } from "./types";

export function enumTypeOf(values: JsonValue[], type: JsonValue | undefined): EnumType | undefined {
  const allows = (enumType: EnumType) =>
    type === undefined || type === enumType || (Array.isArray(type) && type.includes(enumType));

  const numbers = values.every((value) => typeof value === "number" && Number.isFinite(value));

  if (values.length === 0) return undefined;

  if (allows("string") && values.every((value) => typeof value === "string")) return "string";

  if (numbers && allows("number")) return "number";

  if (numbers && allows("integer") && values.every((value) => Number.isInteger(value))) {
    return "integer";
  }

  if (allows("boolean") && values.every((value) => typeof value === "boolean")) return "boolean";

  return undefined;
}

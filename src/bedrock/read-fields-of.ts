import { fieldOf } from "../speech/field-of";
import type { ReadField } from "../wire/types";
import { READ_FIELDS, USAGE_COUNT_FIELDS } from "./constants";

export function readFieldsOf(type: string, event: unknown): readonly ReadField[] {
  const fields = READ_FIELDS[type] ?? [];
  const usage = fieldOf(fieldOf(event, "metadata"), "usage");

  if (type !== "metadata" || typeof usage !== "object" || usage === null) return fields;

  return [...fields, ...USAGE_COUNT_FIELDS];
}

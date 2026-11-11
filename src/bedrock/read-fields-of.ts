import { fieldOf } from "../speech/field-of";
import type { ReadField } from "../wire/types";
import { FIELDS_WITHIN, READ_FIELDS } from "./constants";

export function readFieldsOf(type: string, event: unknown): readonly ReadField[] {
  const fields = READ_FIELDS[type] ?? [];
  const within = FIELDS_WITHIN[type];
  const parent = within?.parent.reduce(fieldOf, event);

  if (!within || typeof parent !== "object" || parent === null) return fields;

  return [...fields, ...within.fields];
}

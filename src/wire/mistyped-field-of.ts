import { fieldOf } from "../speech/field-of";
import type { ReadField } from "./types";

const typeOf = (value: unknown): string => {
  if (value === null) return "null";

  return Array.isArray(value) ? "array" : typeof value;
};

const isMistyped = (value: unknown, { type, required }: ReadField): boolean =>
  (required === true || (value !== undefined && value !== null)) && typeOf(value) !== type;

export function mistypedFieldOf(event: unknown, fields: readonly ReadField[]): string | undefined {
  if (typeOf(event) !== "object") return `the event is ${typeOf(event)}, not an object`;

  const field = fields.find((read) => isMistyped(read.path.reduce(fieldOf, event), read));

  return field && `${field.path.join(".")} is not a ${field.type}`;
}

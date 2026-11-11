import { fieldOf } from "../speech/field-of";
import type { ReadField } from "./types";

const typeOf = (value: unknown): string => {
  if (value === null) return "null";

  return Array.isArray(value) ? "array" : typeof value;
};

const isMistyped = (value: unknown, type: string): boolean =>
  value !== undefined && value !== null && typeOf(value) !== type;

export function mistypedFieldOf(event: unknown, fields: readonly ReadField[]): string | undefined {
  if (typeOf(event) !== "object") return `the event is ${typeOf(event)}, not an object`;

  const field = fields.find(({ path, type }) => isMistyped(path.reduce(fieldOf, event), type));

  return field && `${field.path.join(".")} is not a ${field.type}`;
}

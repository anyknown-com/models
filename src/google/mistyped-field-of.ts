import { fieldOf } from "../speech/field-of";
import { CHUNK_FIELDS, PART_FIELDS, PARTS_PATH } from "./constants";
import type { ReadField } from "./types";

const typeOf = (value: unknown): string => {
  if (value === null) return "null";

  return Array.isArray(value) ? "array" : typeof value;
};

const isMistyped = (value: unknown, { type, required }: ReadField): boolean =>
  (required === true || (value !== undefined && value !== null)) && typeOf(value) !== type;

const partFieldsOf = (parts: unknown): ReadField[] =>
  (Array.isArray(parts) ? parts : []).flatMap((_, index) =>
    PART_FIELDS.map((field) => ({ ...field, path: [...PARTS_PATH, String(index), ...field.path] })),
  );

export function mistypedFieldOf(chunk: unknown): string | undefined {
  if (typeOf(chunk) !== "object") return `the chunk is ${typeOf(chunk)}, not an object`;

  const fields = [...CHUNK_FIELDS, ...partFieldsOf(PARTS_PATH.reduce(fieldOf, chunk))];
  const field = fields.find((read) => isMistyped(read.path.reduce(fieldOf, chunk), read));

  return field && `${field.path.join(".")} is not a ${field.type}`;
}

import { fieldOf } from "../speech/field-of";

type ErrorFields = { message: string; code?: string };

const stringOf = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export function errorOf(value: unknown): ErrorFields | undefined {
  const error = fieldOf(value, "error");

  if (typeof error === "string") return { message: error };

  const message = stringOf(fieldOf(error, "message"));
  const code = stringOf(fieldOf(error, "code")) ?? stringOf(fieldOf(error, "type"));

  if (message === undefined) return undefined;

  return code === undefined ? { message } : { message, code };
}

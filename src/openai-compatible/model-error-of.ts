import type { ModelError } from "../model-error";
import { errorOf } from "./error-of";
import { parsedOf } from "./parsed-of";

const OVERFLOW = /context|tokens/i;

export function modelErrorOf(
  body: string,
  status: number,
): { kind?: ModelError["kind"]; code?: string; message: string } {
  const fields = errorOf(parsedOf(body)) ?? { message: body };
  const overflow = status === 400 && OVERFLOW.test(`${fields.message} ${body}`);

  return overflow ? { ...fields, kind: "overflow" } : fields;
}

import { fieldOf } from "./field-of";
import { textOf } from "./text-of";

export const providerCode = (body: unknown): string | undefined =>
  textOf(fieldOf(fieldOf(body, "error"), "code")) ??
  textOf(fieldOf(body, "err_code")) ??
  textOf(fieldOf(fieldOf(body, "detail"), "status"));

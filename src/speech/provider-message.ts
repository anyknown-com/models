import { fieldOf } from "./field-of";
import { textOf } from "./text-of";

export const providerMessage = (body: unknown): string | undefined =>
  textOf(fieldOf(fieldOf(body, "detail"), "message")) ??
  textOf(fieldOf(body, "detail")) ??
  textOf(fieldOf(fieldOf(body, "error"), "message")) ??
  textOf(fieldOf(body, "message"));

import { ModelError } from "../model-error";
import { fieldOf } from "../speech/field-of";
import { PROVIDER } from "./constants";

const INPUT_CODE = /invalid|bad.?request/i;

const firstErrorOf = (body: unknown): unknown => {
  const errors = fieldOf(body, "errors");

  return Array.isArray(errors) ? errors[0] : undefined;
};

export function videoFailureOf(body: unknown, status: "failed" | "cancelled"): ModelError {
  const first = firstErrorOf(body);
  const reported = fieldOf(first, "code");
  const message = fieldOf(first, "message");
  const code = status === "cancelled" ? status : reported;

  return new ModelError({
    kind: typeof code === "string" && INPUT_CODE.test(code) ? "bad-request" : "server",
    provider: PROVIDER,
    retryable: false,
    ...(typeof code === "string" ? { code } : {}),
    message: typeof message === "string" ? message : `google video job ${status}`,
    body: JSON.stringify(body),
  });
}

import { ModelError } from "../model-error";
import { fieldOf } from "../speech/field-of";
import { PROVIDER, VIDEO_ENDED } from "./constants";

const INPUT_CODE = /invalid|bad.?request/i;

const firstErrorOf = (body: unknown): unknown => {
  const errors = fieldOf(body, "errors");

  return Array.isArray(errors) ? errors[0] : undefined;
};

const endedMessageOf = (status: unknown): string =>
  typeof status === "string" && Object.hasOwn(VIDEO_ENDED, status)
    ? VIDEO_ENDED[status]
    : `google video job has unknown status ${JSON.stringify(status) ?? "undefined"}`;

export function videoFailureOf(body: unknown, status: unknown): ModelError {
  const first = firstErrorOf(body);
  const reported = fieldOf(first, "code");
  const message = fieldOf(first, "message");
  const code = status === "failed" ? reported : status;

  return new ModelError({
    kind: typeof code === "string" && INPUT_CODE.test(code) ? "bad-request" : "server",
    provider: PROVIDER,
    retryable: false,
    ...(typeof code === "string" ? { code } : {}),
    message: typeof message === "string" ? message : endedMessageOf(status),
    body: JSON.stringify(body),
  });
}

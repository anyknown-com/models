import type { ModelError } from "../model-error";

const kindOf = (status: number): ModelError["kind"] => {
  if (status === 401 || status === 403) return "auth";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limit";

  return status >= 500 ? "server" : "bad-request";
};

export const errorKindOf = (status: number): Pick<ModelError, "kind" | "retryable"> => ({
  kind: kindOf(status),
  retryable: status === 408 || status === 409 || status === 429 || status >= 500,
});

import type { ModelError } from "../model-error";

export function kindOfStatus(status: number): ModelError["kind"] {
  if (status === 401 || status === 403) return "auth";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limit";
  if (status >= 500) return "server";

  return "bad-request";
}

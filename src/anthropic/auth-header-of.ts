import type { AnthropicAuth } from "./types";

export function authHeaderOf(auth: AnthropicAuth): Record<string, string> {
  return "token" in auth ? { authorization: `Bearer ${auth.token}` } : { "x-api-key": auth.key };
}

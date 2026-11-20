import { CLAUDE_CODE_HEADERS } from "./constants";
import type { AnthropicAuth } from "./types";

export function authHeaderOf(auth: AnthropicAuth): Record<string, string> {
  return "token" in auth
    ? { authorization: `Bearer ${auth.token}`, ...CLAUDE_CODE_HEADERS }
    : { "x-api-key": auth.key };
}

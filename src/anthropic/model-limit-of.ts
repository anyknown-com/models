import {
  KNOWN_MAX_OUTPUT_TOKENS,
  LEGACY_CLAUDE,
  NEWER_CLAUDE_MAX_OUTPUT_TOKENS,
  UNKNOWN_MODEL_MAX_OUTPUT_TOKENS,
} from "./constants";

type ModelLimit = { maxOutputTokens: number; known: boolean };

const unknownLimitOf = (model: string): number =>
  !LEGACY_CLAUDE.test(model) && model.includes("claude-")
    ? NEWER_CLAUDE_MAX_OUTPUT_TOKENS
    : UNKNOWN_MODEL_MAX_OUTPUT_TOKENS;

export function modelLimitOf(model: string): ModelLimit {
  const known = KNOWN_MAX_OUTPUT_TOKENS.find(([ids]) => ids.some((id) => model.includes(id)));

  if (known) return { maxOutputTokens: known[1], known: true };

  return { maxOutputTokens: unknownLimitOf(model), known: false };
}

import {
  KNOWN_MODELS,
  LEGACY_CLAUDE,
  NEWER_CLAUDE_MAX_OUTPUT_TOKENS,
  UNKNOWN_MODEL_MAX_OUTPUT_TOKENS,
} from "./constants";
import type { ClaudeModel } from "./types";

const unknownModelOf = (model: string): ClaudeModel => {
  const newer = !LEGACY_CLAUDE.test(model) && model.includes("claude-");

  return {
    maxOutputTokens: newer ? NEWER_CLAUDE_MAX_OUTPUT_TOKENS : UNKNOWN_MODEL_MAX_OUTPUT_TOKENS,
    known: false,
    structuredOutput: newer,
    adaptiveThinking: newer,
    xhighEffort: newer,
  };
};

export function claudeModelOf(model: string): ClaudeModel {
  const known = KNOWN_MODELS.find(({ ids }) => ids.some((id) => model.includes(id)));

  if (!known) return unknownModelOf(model);

  const { ids: _ids, ...limits } = known;

  return { ...limits, known: true };
}

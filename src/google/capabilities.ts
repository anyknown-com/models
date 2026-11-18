import type { TextCapabilities } from "../types/text-capabilities";
import { BUDGET_GEMINI } from "./constants";
import { GEMINI_CONTEXT_WINDOW, KNOWN_MODELS, THINKING_LEVELS } from "./known-models";

const thinkingOf = (model: string, levels: readonly string[]): TextCapabilities["thinking"] => {
  if (levels.length === 0) return "none";

  return BUDGET_GEMINI.test(model) ? "budget" : "adaptive";
};

export function capabilities(model: string): TextCapabilities {
  const id = model.replace(/^models\//, "");
  const levels = THINKING_LEVELS.get(id) ?? [];

  return {
    thinking: thinkingOf(id, levels),
    effortLevels: levels,
    contextWindow: KNOWN_MODELS.includes(id) ? GEMINI_CONTEXT_WINDOW : null,
  };
}

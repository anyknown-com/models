import type { TextCapabilities } from "../types/text-capabilities";
import { claudeModelOf } from "./claude-model-of";
import { CONTEXT_WINDOWS, EFFORT_LEVELS } from "./constants";

const contextWindowOf = (model: string): number | null =>
  CONTEXT_WINDOWS.find(({ ids }) => ids.some((id) => model.includes(id)))?.contextWindow ?? null;

export function capabilities(model: string): TextCapabilities {
  const { adaptiveThinking, xhighEffort } = claudeModelOf(model);

  return {
    thinking: adaptiveThinking ? "adaptive" : "budget",
    effortLevels: EFFORT_LEVELS.filter((level) => xhighEffort || level !== "xhigh"),
    contextWindow: contextWindowOf(model),
  };
}

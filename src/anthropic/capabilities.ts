import type { TextCapabilities } from "../types/text-capabilities";
import { claudeModelOf } from "./claude-model-of";
import { EFFORT_LEVELS } from "./constants";

export function capabilities(model: string): TextCapabilities {
  const { adaptiveThinking, xhighEffort } = claudeModelOf(model);

  return {
    thinking: adaptiveThinking ? "adaptive" : "budget",
    effortLevels: EFFORT_LEVELS.filter((level) => xhighEffort || level !== "xhigh"),
  };
}

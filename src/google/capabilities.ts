import type { TextCapabilities } from "../types/text-capabilities";
import { GEMINI_CONTEXT_WINDOW, KNOWN_MODELS } from "./known-models";

export function capabilities(model: string): TextCapabilities {
  const known = KNOWN_MODELS.includes(model.replace(/^models\//, ""));

  return {
    thinking: "none",
    effortLevels: [],
    contextWindow: known ? GEMINI_CONTEXT_WINDOW : null,
  };
}

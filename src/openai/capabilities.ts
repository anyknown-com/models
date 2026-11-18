import type { TextCapabilities } from "../types/text-capabilities";
import { isReasoningModel } from "./is-reasoning-model";
import { KNOWN_MODELS, LOW_TO_HIGH } from "./known-models";

const SNAPSHOT = /-\d{4}-\d{2}-\d{2}$/;

const unknownEffortOf = (model: string): readonly string[] =>
  isReasoningModel(model) ? LOW_TO_HIGH : [];

export function capabilities(model: string): TextCapabilities {
  const known = KNOWN_MODELS.get(model.replace(SNAPSHOT, ""));
  const effortLevels = known?.effortLevels ?? unknownEffortOf(model);

  return {
    thinking: effortLevels.length > 0 ? "adaptive" : "none",
    effortLevels,
    contextWindow: known?.contextWindow ?? null,
  };
}

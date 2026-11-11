import { fieldOf } from "../speech/field-of";

export const isAnthropicModel = (model: string, reasoningConfig: unknown): boolean =>
  model.includes("anthropic") ||
  (model.includes(":application-inference-profile/") &&
    fieldOf(reasoningConfig, "budgetTokens") !== undefined);

import { fieldOf } from "../speech/field-of";

export function thinkingBudgetOf(reasoningConfig: unknown): number | undefined {
  const budget = fieldOf(reasoningConfig, "budgetTokens");

  if (fieldOf(reasoningConfig, "type") !== "enabled") return undefined;

  return typeof budget === "number" ? budget : undefined;
}

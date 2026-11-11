import { fieldOf } from "../speech/field-of";
import type { JsonObject } from "../types/json";
import { DEFAULT_THINKING_BUDGET } from "./constants";

type Thinking = { thinking: JsonObject; budget: number };

const budgetOf = (value: unknown): number => {
  const budget = fieldOf(value, "budgetTokens");

  return typeof budget === "number" ? budget : DEFAULT_THINKING_BUDGET;
};

export function thinkingOf(value: unknown): Thinking | undefined {
  const type = fieldOf(value, "type");

  if (type === "adaptive") return { thinking: { type }, budget: 0 };
  if (type !== "enabled") return undefined;

  const budget = budgetOf(value);

  return { thinking: { type, budget_tokens: budget }, budget };
}

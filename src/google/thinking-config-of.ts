import { fieldOf } from "../speech/field-of";
import type { JsonObject, JsonValue } from "../types/json";
import { BUDGET_GEMINI, LEVEL_BUDGETS } from "./constants";

export function thinkingConfigOf(model: string, config: JsonValue): JsonValue {
  const level = fieldOf(config, "thinkingLevel");
  const budget = typeof level === "string" ? LEVEL_BUDGETS.get(level) : undefined;

  if (!BUDGET_GEMINI.test(model) || budget === undefined) return config;

  const { thinkingLevel: _level, ...rest } = config as JsonObject;

  return { ...rest, thinkingBudget: budget };
}

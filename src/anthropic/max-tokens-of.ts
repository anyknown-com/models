import { claudeModelOf } from "./claude-model-of";

export function maxTokensOf(
  model: string,
  maxOutputTokens: number | undefined,
  thinkingBudget: number,
): number {
  const limit = claudeModelOf(model);
  const maxTokens = (maxOutputTokens ?? limit.maxOutputTokens) + thinkingBudget;

  return limit.known ? Math.min(maxTokens, limit.maxOutputTokens) : maxTokens;
}

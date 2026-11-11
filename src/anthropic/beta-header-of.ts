import type { ToolDeclaration } from "../types/tool";
import { claudeModelOf } from "./claude-model-of";
import { STRUCTURED_OUTPUTS_BETA } from "./constants";

export function betaHeaderOf(model: string, tools: ToolDeclaration[]): Record<string, string> {
  if (tools.length === 0 || !claudeModelOf(model).structuredOutput) return {};

  return { "anthropic-beta": STRUCTURED_OUTPUTS_BETA };
}

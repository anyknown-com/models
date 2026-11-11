import type { JsonObject } from "../types/json";
import type { ToolDeclaration } from "../types/tool";
import { functionDeclarationOf } from "./function-declaration-of";

export function toTools(tools: ToolDeclaration[] = []): JsonObject {
  if (tools.length === 0) return {};

  return {
    tools: [{ functionDeclarations: tools.map(functionDeclarationOf) }],
    toolConfig: { functionCallingConfig: { mode: "AUTO" } },
  };
}

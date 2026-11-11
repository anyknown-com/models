import type { JsonObject } from "../types/json";

const isToolUse = (block: JsonObject): boolean => block.type === "tool_use";

export const withToolUseLast = (content: JsonObject[]): JsonObject[] => [
  ...content.filter((block) => !isToolUse(block)),
  ...content.filter(isToolUse),
];

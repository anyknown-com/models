import type { JsonObject } from "../types/json";
import type { TextPart } from "../types/parts";

export function instructionsOf(system: TextPart[] = []): JsonObject[] {
  const text = system.map((part) => part.text).join("\n\n");

  if (text === "") return [];

  return [{ role: "developer", content: [{ type: "input_text", text }] }];
}

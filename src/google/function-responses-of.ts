import type { JsonObject } from "../types/json";
import type { ToolResultPart } from "../types/parts";
import { TOOL_SUCCEEDED } from "./constants";
import { functionResponseOf } from "./function-response-of";
import { legacyResponsePartsOf } from "./legacy-response-parts-of";
import { responsePartOf } from "./response-part-of";

export function functionResponsesOf(part: ToolResultPart, gemini3: boolean): JsonObject[] {
  const { output } = part;

  if (output.type !== "content") return [functionResponseOf(part, output.value)];
  if (!gemini3) return output.value.flatMap((item) => legacyResponsePartsOf(part, item));

  const responseParts = output.value.map(responsePartOf);
  const texts = responseParts.filter((p) => typeof p === "string");
  const inline = responseParts.filter((p) => typeof p !== "string");
  const content = texts.length > 0 ? texts.join("\n") : TOOL_SUCCEEDED;

  return [functionResponseOf(part, content, inline)];
}

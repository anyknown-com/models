import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart, TextPart, ToolResultPart } from "../types/parts";
import { PROVIDER, TOOL_SUCCEEDED } from "./constants";
import { functionResponseOf } from "./function-response-of";
import { unsupported } from "../wire/unsupported";

const textOf = (part: TextPart | ImagePart | FilePart): string => {
  if (part.type !== "text") {
    throw unsupported(PROVIDER, `google does not send a tool result ${part.type} part yet`);
  }

  return part.text;
};

export function functionResponsesOf(part: ToolResultPart, gemini3: boolean): JsonObject[] {
  const { output } = part;

  if (output.type !== "content") return [functionResponseOf(part, output.value)];

  const texts = output.value.map(textOf);

  if (!gemini3) return texts.map((text) => functionResponseOf(part, text));

  return [functionResponseOf(part, texts.length > 0 ? texts.join("\n") : TOOL_SUCCEEDED)];
}

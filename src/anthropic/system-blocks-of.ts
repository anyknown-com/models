import type { JsonObject } from "../types/json";
import type { TextPart } from "../types/parts";
import { CLAUDE_CODE_IDENTITY } from "./constants";
import { textBlockOf } from "./text-block-of";
import type { AnthropicAuth } from "./types";

export function systemBlocksOf(auth: AnthropicAuth, system: TextPart[]): JsonObject[] {
  const blocks = system.map(textBlockOf);

  if (!("token" in auth) || system[0]?.text === CLAUDE_CODE_IDENTITY) return blocks;

  return [{ type: "text", text: CLAUDE_CODE_IDENTITY }, ...blocks];
}

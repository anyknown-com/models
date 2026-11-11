import type { JsonObject, JsonValue } from "../types/json";
import { isJsonObject } from "./is-json-object";
import type { AnthropicMessage } from "./types";

const documentSourceOf = (block: JsonValue): JsonValue | undefined =>
  isJsonObject(block) && block.type === "document" && isJsonObject(block.source)
    ? block.source.type
    : undefined;

const nestedOf = ({ type, content }: JsonObject): JsonValue[] =>
  type === "tool_result" && Array.isArray(content) ? content : [];

const asksForPdfs = (block: JsonObject): boolean => {
  const source = documentSourceOf(block);

  return (
    (source !== undefined && source !== "text") ||
    nestedOf(block).some((nested) => documentSourceOf(nested) === "base64")
  );
};

export const sendsPdf = (messages: AnthropicMessage[]): boolean =>
  messages.some(({ content }) => content.some(asksForPdfs));

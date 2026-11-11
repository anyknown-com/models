import type { ModelMessage } from "../types/model-message";
import { isToolPart } from "./is-tool-part";
import { toolPartsDropped } from "./tool-parts-dropped";

const hasToolParts = ({ content }: ModelMessage) =>
  typeof content !== "string" && content.some(isToolPart);

export const withoutToolParts = (messages: ModelMessage[]): ModelMessage[] =>
  messages.some(hasToolParts) ? messages.flatMap(toolPartsDropped) : messages;

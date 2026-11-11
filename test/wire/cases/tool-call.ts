import type { TextRequest } from "../../../src/types/text-request";
import { tools } from "./tools";

export const toolCall: TextRequest = {
  model: "model",
  tools: tools.tools,
  messages: [{ role: "user", content: "What are the weather and the time in Paris right now?" }],
};

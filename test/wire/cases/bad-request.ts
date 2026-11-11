import type { TextRequest } from "../../../src/types/text-request";

export const badRequest: TextRequest = {
  model: "model",
  maxOutputTokens: -1,
  messages: [{ role: "user", content: "Hello." }],
};

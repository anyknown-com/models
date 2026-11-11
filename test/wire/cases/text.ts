import type { TextRequest } from "../../../src/types/text-request";

export const text: TextRequest = {
  model: "model",
  system: [
    { type: "text", text: "You are a terse assistant." },
    { type: "text", text: "Answer in one short sentence." },
  ],
  messages: [{ role: "user", content: "Name one planet in the solar system." }],
};

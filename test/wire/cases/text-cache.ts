import type { TextRequest } from "../../../src/types/text-request";

const RULES = Array.from(
  { length: 700 },
  (_, index) =>
    `Style rule ${index + 1}: keep sentence ${index + 1} short, plain and free of hedging words.`,
).join("\n");

export const textCache: TextRequest = {
  model: "model",
  system: [
    { type: "text", text: "You are a terse assistant. Answer in one short sentence." },
    { type: "text", text: RULES },
  ],
  messages: [{ role: "user", content: "Name one planet in the solar system." }],
  providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
};

import type { TextRequest } from "../../../src/types/text-request";

export const reasoning: TextRequest = {
  model: "model",
  messages: [
    { role: "user", content: "What is 17 * 23?" },
    {
      role: "assistant",
      content: [
        { type: "reasoning", text: "17 * 23 = 17 * 20 + 17 * 3 = 340 + 51 = 391." },
        { type: "text", text: "391" },
      ],
    },
    { role: "user", content: "And that plus 9?" },
  ],
};

import type { TextRequest } from "../../../src/types/text-request";

export const tools: TextRequest = {
  model: "model",
  tools: [
    {
      name: "get_weather",
      description: "Get the current weather in a city.",
      inputSchema: {
        type: "object",
        properties: { city: { type: "string" } },
        required: ["city"],
      },
    },
    {
      name: "get_time",
      description: "Get the current time in a time zone.",
      inputSchema: {
        type: "object",
        properties: { timezone: { type: "string" } },
        required: ["timezone"],
      },
    },
  ],
  messages: [
    { role: "user", content: "What is the weather in Paris?" },
    {
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolCallId: "call_1",
          toolName: "get_weather",
          input: { city: "Paris" },
        },
      ],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "call_1",
          toolName: "get_weather",
          output: { type: "json", value: { temperature: 18, condition: "cloudy" } },
        },
      ],
    },
  ],
};

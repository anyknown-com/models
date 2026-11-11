import { describe, expect, it } from "vitest";
import type { JsonValue } from "../../../src/types/json";
import type { ToolCallPart, ToolResultOutput, ToolResultPart } from "../../../src/types/parts";
import { reasoning, tools } from "../cases";
import type { Fixture } from "../fixture";
import reasoningJson from "../fixtures/bedrock/reasoning.json";
import toolsJson from "../fixtures/bedrock/tools.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const toolsFixture = toolsJson as unknown as Fixture;
const reasoningFixture = reasoningJson as unknown as Fixture;
const model = "us.anthropic.claude-haiku-4-5-20251001-v1:0";

const call = (toolCallId: string, input: JsonValue, toolName = "get_weather"): ToolCallPart => ({
  type: "tool-call",
  toolCallId,
  toolName,
  input,
});

const result = (toolCallId: string, output: ToolResultOutput): ToolResultPart => ({
  type: "tool-result",
  toolCallId,
  toolName: "get_weather",
  output,
});

const toolResult = (toolUseId: string, text: string) => ({
  toolResult: { toolUseId, content: [{ text }] },
});

describe("bedrock tool request", () => {
  it("sends the tools and reasoning cases as the fixtures' requests", async () => {
    const sentTools = await sentRequest({ ...tools, model });
    const sentReasoning = await sentRequest({ ...reasoning, model });

    expect(requestDiffs(toolsFixture.request, sentTools.request, sentTools.body)).toEqual([]);
    expect(
      requestDiffs(reasoningFixture.request, sentReasoning.request, sentReasoning.body),
    ).toEqual([]);
  });

  it("joins tool results into the user turn with mistral ids, clean names and object input", async () => {
    const { body } = await sentRequest({
      ...tools,
      model: "mistral.mistral-large-2407-v1:0",
      messages: [
        { role: "user", content: "q" },
        {
          role: "assistant",
          content: [
            call("tooluse_bpe71yCfRu2b5i-nKGDr5g", "s", "get.weather!"),
            call("c2", { a: 2 }),
          ],
        },
        {
          role: "tool",
          content: [
            result("tooluse_bpe71yCfRu2b5i-nKGDr5g", { type: "error-text", value: "bad" }),
            result("c2", { type: "content", value: [{ type: "text", text: "x" }] }),
          ],
        },
        { role: "tool", content: [] },
        { role: "user", content: "next" },
      ],
    });

    expect(body.messages).toEqual([
      { role: "user", content: [{ text: "q" }] },
      {
        role: "assistant",
        content: [
          {
            toolUse: {
              toolUseId: "toolusebp",
              name: "getweather",
              input: { rawInvalidInput: "s" },
            },
          },
          { toolUse: { toolUseId: "c2", name: "get_weather", input: { a: 2 } } },
        ],
      },
      {
        role: "user",
        content: [toolResult("toolusebp", "bad"), toolResult("c2", "x"), { text: "next" }],
      },
    ]);
  });

  it("drops tool calls and results when the request declares no tool", async () => {
    const { body } = await sentRequest({
      model,
      messages: [
        { role: "user", content: "q" },
        { role: "assistant", content: [{ type: "text", text: "looking " }, call("c1", {})] },
        { role: "tool", content: [result("c1", { type: "text", value: "x" })] },
        { role: "user", content: "more" },
      ],
    });

    expect(body.messages).toEqual([
      { role: "user", content: [{ text: "q" }] },
      { role: "assistant", content: [{ text: "looking " }] },
      { role: "user", content: [{ text: "more" }] },
    ]);

    expect(body).not.toHaveProperty("toolConfig");
  });

  it("sends only signed or redacted reasoning back", async () => {
    const { body } = await sentRequest({
      model,
      messages: [
        { role: "user", content: "q" },
        {
          role: "assistant",
          content: [
            { type: "reasoning", text: "plain" },
            { type: "reasoning", text: " r ", providerOptions: { bedrock: { signature: "sig" } } },
            { type: "reasoning", text: "", providerOptions: { bedrock: { redactedData: "rd" } } },
            { type: "text", text: "  " },
            { type: "text", text: "a " },
          ],
        },
      ],
    });

    expect(body.messages).toEqual([
      { role: "user", content: [{ text: "q" }] },
      {
        role: "assistant",
        content: [
          { reasoningContent: { reasoningText: { text: " r ", signature: "sig" } } },
          { reasoningContent: { redactedReasoning: { data: "rd" } } },
          { text: "  " },
          { text: "a" },
        ],
      },
    ]);
  });
});

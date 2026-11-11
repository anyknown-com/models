import { describe, expect, it } from "vitest";
import type { ToolCallPart, ToolResultOutput, ToolResultPart } from "../../../src/types/parts";
import type { TextRequest } from "../../../src/types/text-request";
import { reasoning, tools } from "../cases";
import type { Fixture } from "../fixture";
import reasoningFixture from "../fixtures/anthropic/reasoning.json";
import toolsJson from "../fixtures/anthropic/tools.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const toolsFixture = toolsJson as unknown as Fixture;
const model = "claude-haiku-4-5";
const ephemeral = { anthropic: { cacheControl: { type: "ephemeral" } } };

const call = (toolCallId: string, input: ToolCallPart["input"]): ToolCallPart => ({
  type: "tool-call",
  toolCallId,
  toolName: "get_weather",
  input,
});

const result = (toolCallId: string, output: ToolResultOutput): ToolResultPart => ({
  type: "tool-result",
  toolCallId,
  toolName: "get_weather",
  output,
});

const withMessages = (messages: TextRequest["messages"]): TextRequest => ({
  ...tools,
  model,
  messages: [{ role: "user", content: "go" }, ...messages],
});

describe("anthropic tool request", () => {
  it("sends the tools case as the fixture's request", async () => {
    const { request, body } = await sentRequest({ ...tools, model });

    expect(requestDiffs(toolsFixture.request, request, body)).toEqual([]);
  });

  it("leaves reasoning parts out, as the journal has no thinking signature", async () => {
    const { request, body } = await sentRequest({ ...reasoning, model });

    expect(requestDiffs(reasoningFixture.request, request, body)).toEqual([]);
  });

  it("puts tool_use after the text and joins tool results with the next user turn", async () => {
    const { body } = await sentRequest(
      withMessages([
        { role: "assistant", content: [call("c1", { a: 1 }), { type: "text", text: "a " }] },
        { role: "assistant", content: [call("c2", "raw")] },
        {
          role: "tool",
          content: [
            result("c1", { type: "error-text", value: "bad" }),
            result("c2", { type: "content", value: [{ type: "text", text: "x" }] }),
          ],
        },
        { role: "tool", content: [] },
        { role: "user", content: "next" },
      ]),
    );

    expect(body.messages).toEqual([
      { role: "user", content: [{ type: "text", text: "go" }] },
      {
        role: "assistant",
        content: [
          { type: "text", text: "a " },
          { type: "tool_use", id: "c1", name: "get_weather", input: { a: 1 } },
          { type: "tool_use", id: "c2", name: "get_weather", input: { rawInvalidInput: "raw" } },
        ],
      },
      {
        role: "user",
        content: [
          { type: "tool_result", tool_use_id: "c1", content: "bad", is_error: true },
          { type: "tool_result", tool_use_id: "c2", content: [{ type: "text", text: "x" }] },
          { type: "text", text: "next" },
        ],
      },
    ]);
  });

  it("sends json results as a string and marks error-json as an error", async () => {
    const { body } = await sentRequest(
      withMessages([
        { role: "assistant", content: [call("c1", {}), call("c2", {})] },
        {
          role: "tool",
          content: [
            result("c1", { type: "json", value: { t: 18 } }),
            result("c2", { type: "error-json", value: { e: 1 } }),
          ],
        },
      ]),
    );

    expect(body.messages).toContainEqual({
      role: "user",
      content: [
        { type: "tool_result", tool_use_id: "c1", content: '{"t":18}' },
        { type: "tool_result", tool_use_id: "c2", content: '{"e":1}', is_error: true },
      ],
    });
  });

  it("puts the cacheControl of a tool call, a tool result or its output on that block", async () => {
    const { body } = await sentRequest(
      withMessages([
        { role: "assistant", content: [{ ...call("c1", {}), providerOptions: ephemeral }] },
        {
          role: "tool",
          content: [
            { ...result("c1", { type: "text", value: "t" }), providerOptions: ephemeral },
            result("c2", { type: "text", value: "u", providerOptions: ephemeral }),
          ],
        },
      ]),
    );

    expect(body.messages).toEqual([
      { role: "user", content: [{ type: "text", text: "go" }] },
      {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "c1",
            name: "get_weather",
            input: {},
            cache_control: { type: "ephemeral" },
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "c1",
            content: "t",
            cache_control: { type: "ephemeral" },
          },
          {
            type: "tool_result",
            tool_use_id: "c2",
            content: "u",
            cache_control: { type: "ephemeral" },
          },
        ],
      },
    ]);
  });

  it("asks for the structured outputs beta only for models that have it", async () => {
    const older = await sentRequest({ ...tools, model: "claude-sonnet-4-0" });
    const none = await sentRequest({ ...tools, model, tools: [] });

    expect(older.request.headers.get("anthropic-beta")).toBeNull();
    expect(older.body.tool_choice).toEqual({ type: "auto" });
    expect(none.request.headers.get("anthropic-beta")).toBeNull();
    expect([none.body.tools, none.body.tool_choice]).toEqual([undefined, undefined]);
  });
});

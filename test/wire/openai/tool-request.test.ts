import { describe, expect, it } from "vitest";
import type { ToolCallPart, ToolResultOutput, ToolResultPart } from "../../../src/types/parts";
import type { TextRequest } from "../../../src/types/text-request";
import { reasoning, tools } from "../cases";
import type { Fixture } from "../fixture";
import reasoningJson from "../fixtures/openai/reasoning.json";
import toolsJson from "../fixtures/openai/tools.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const toolsFixture = toolsJson as unknown as Fixture;
const reasoningFixture = reasoningJson as unknown as Fixture;
const model = "gpt-6-luna";

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

const functionCall = (id: string, args: string) => ({
  type: "function_call",
  call_id: id,
  name: "get_weather",
  arguments: args,
});

const go = { role: "user", content: [{ type: "input_text", text: "go" }] };

describe("openai tool request", () => {
  it("sends the tools case as the fixture's request", async () => {
    const { request, body } = await sentRequest({ ...tools, model });

    expect(requestDiffs(toolsFixture.request, request, body)).toEqual([]);
  });

  it("leaves reasoning parts out, as the journal has no reasoning item id", async () => {
    const { request, body } = await sentRequest({ ...reasoning, model });

    expect(requestDiffs(reasoningFixture.request, request, body)).toEqual([]);
  });

  it("keeps the order of assistant parts and sends one output item per tool result", async () => {
    const { body } = await sentRequest(
      withMessages([
        { role: "assistant", content: [call("c1", { a: 1 }), { type: "text", text: "a " }] },
        { role: "assistant", content: [call("c2", "raw"), call("c3", {}), call("c4", null)] },
        {
          role: "tool",
          content: [
            result("c1", { type: "error-text", value: "bad" }),
            result("c2", { type: "content", value: [{ type: "text", text: "x" }] }),
          ],
        },
        { role: "tool", content: [] },
        {
          role: "tool",
          content: [
            result("c3", { type: "json", value: { t: 18 } }),
            result("c4", { type: "error-json", value: { e: 1 } }),
          ],
        },
      ]),
    );

    expect(body.input).toEqual([
      go,
      functionCall("c1", '{"a":1}'),
      { role: "assistant", content: [{ type: "output_text", text: "a " }] },
      functionCall("c2", '"raw"'),
      functionCall("c3", "{}"),
      functionCall("c4", "null"),
      { type: "function_call_output", call_id: "c1", output: "bad" },
      { type: "function_call_output", call_id: "c2", output: [{ type: "input_text", text: "x" }] },
      { type: "function_call_output", call_id: "c3", output: '{"t":18}' },
      { type: "function_call_output", call_id: "c4", output: '{"e":1}' },
    ]);
  });

  it("leaves out provider-executed calls and assistant files", async () => {
    const { body } = await sentRequest(
      withMessages([
        {
          role: "assistant",
          content: [
            { ...call("c1", {}), providerExecuted: true },
            { type: "file", data: new Uint8Array([1]), mediaType: "application/pdf" },
            { type: "text", text: "t" },
          ],
        },
      ]),
    );

    expect(body.input).toEqual([
      go,
      { role: "assistant", content: [{ type: "output_text", text: "t" }] },
    ]);
  });

  it("sends no tools and no tool_choice without tool declarations", async () => {
    const { body } = await sentRequest({ ...tools, model, tools: [] });

    expect([body.tools, body.tool_choice]).toEqual([undefined, undefined]);
  });
});

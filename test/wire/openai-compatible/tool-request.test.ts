import { describe, expect, it } from "vitest";
import { buildRequest } from "../../../src/openai-compatible/build-request";
import type { ToolResultOutput } from "../../../src/types/parts";

const CONFIG = { name: "openrouter", key: "k", baseUrl: "https://api.example.test/v1" };

const toolMessageOf = (output: ToolResultOutput) => {
  const { body } = buildRequest(CONFIG, {
    model: "m",
    messages: [
      { role: "tool", content: [{ type: "tool-result", toolCallId: "c", toolName: "t", output }] },
    ],
  });

  return (body.messages as unknown[])[0];
};

describe("openai-compatible tool request", () => {
  it("sends text outputs as they are and json outputs as a JSON string", () => {
    expect(toolMessageOf({ type: "text", value: "ok" })).toEqual({
      role: "tool",
      tool_call_id: "c",
      content: "ok",
    });
    expect(toolMessageOf({ type: "error-text", value: "boom" })).toMatchObject({ content: "boom" });
    expect(toolMessageOf({ type: "json", value: { a: 1 } })).toMatchObject({ content: '{"a":1}' });
    expect(toolMessageOf({ type: "error-json", value: ["x"] })).toMatchObject({ content: '["x"]' });
  });

  it("sends content outputs as a JSON string of the parts the bridge sent, never as parts", () => {
    const output: ToolResultOutput = {
      type: "content",
      value: [
        { type: "text", text: "see" },
        { type: "image", image: new Uint8Array([1, 2, 3]), mediaType: "image/png" },
        { type: "image", image: new URL("https://example.test/a.png") },
        {
          type: "file",
          data: new Uint8Array([4]),
          mediaType: "application/pdf",
          filename: "a.pdf",
        },
        { type: "file", data: new URL("https://example.test/b.pdf"), mediaType: "application/pdf" },
      ],
    };

    expect(toolMessageOf(output)).toMatchObject({
      content: JSON.stringify([
        { type: "text", text: "see" },
        { type: "file", data: { type: "data", data: "AQID" }, mediaType: "image/png" },
        {
          type: "file",
          data: { type: "url", url: "https://example.test/a.png" },
          mediaType: "image",
        },
        {
          type: "file",
          data: { type: "data", data: "BA==" },
          filename: "a.pdf",
          mediaType: "application/pdf",
        },
        {
          type: "file",
          data: { type: "url", url: "https://example.test/b.pdf" },
          mediaType: "application/pdf",
        },
      ]),
    });
  });

  it("sends assistant text next to tool calls, and no tools when the list is empty", () => {
    const { body } = buildRequest(CONFIG, {
      model: "m",
      tools: [],
      messages: [
        {
          role: "assistant",
          content: [
            { type: "text", text: "checking" },
            { type: "tool-call", toolCallId: "c", toolName: "t", input: "raw" },
          ],
        },
      ],
    });

    expect(body).not.toHaveProperty("tools");
    expect(body).not.toHaveProperty("tool_choice");
    expect(body.messages).toEqual([
      {
        role: "assistant",
        content: "checking",
        tool_calls: [{ id: "c", type: "function", function: { name: "t", arguments: '"raw"' } }],
      },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { google } from "../../../src/google";
import type { JsonObject } from "../../../src/types/json";
import type { ToolResultOutput, ToolResultPart } from "../../../src/types/parts";
import type { TextRequest } from "../../../src/types/text-request";
import { reasoning, tools } from "../cases";
import type { Fixture } from "../fixture";
import reasoningJson from "../fixtures/google/reasoning.json";
import toolsJson from "../fixtures/google/tools.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const toolsFixture = toolsJson as unknown as Fixture;
const reasoningFixture = reasoningJson as unknown as Fixture;
const model = "gemini-2.5-flash";

const result = (toolCallId: string, output: ToolResultOutput): ToolResultPart => ({
  type: "tool-result",
  toolCallId,
  toolName: "get_weather",
  output,
});

const roundTrip = (toolsModel: string): TextRequest => ({
  ...tools,
  model: toolsModel,
  messages: [
    { role: "user", content: "go" },
    {
      role: "assistant",
      content: [{ type: "tool-call", toolCallId: "c1", toolName: "get_weather", input: { a: 1 } }],
    },
    { role: "tool", content: [result("c1", { type: "error-text", value: "bad" })] },
    {
      role: "tool",
      content: [
        result("c2", {
          type: "content",
          value: [
            { type: "text", text: "x" },
            { type: "text", text: "y" },
          ],
        }),
      ],
    },
  ],
});

const response = (id: string, content: string) => ({
  functionResponse: { id, name: "get_weather", response: { name: "get_weather", content } },
});

const parametersOf = async (inputSchema: JsonObject) => {
  const { body } = await sentRequest({
    model,
    tools: [{ name: "t", description: "d", inputSchema }],
    messages: [{ role: "user", content: "hi" }],
  });

  return body.tools;
};

describe("google tool request", () => {
  it("sends the tools and reasoning cases as the fixtures' requests", async () => {
    const sentTools = await sentRequest({ ...tools, model });
    const sentReasoning = await sentRequest({ ...reasoning, model });

    expect(requestDiffs(toolsFixture.request, sentTools.request, sentTools.body)).toEqual([]);
    expect(
      requestDiffs(reasoningFixture.request, sentReasoning.request, sentReasoning.body),
    ).toEqual([]);
  });

  it("joins tool messages and sends gemini 3 calls with the skip signature", async () => {
    const older = await sentRequest(roundTrip(model));
    const gemini3 = await sentRequest(roundTrip("gemini-3-pro-preview"));

    expect(older.body.contents).toEqual([
      { role: "user", parts: [{ text: "go" }] },
      {
        role: "model",
        parts: [{ functionCall: { id: "c1", name: "get_weather", args: { a: 1 } } }],
      },
      { role: "user", parts: [response("c1", "bad"), response("c2", "x"), response("c2", "y")] },
    ]);

    expect(gemini3.body.contents).toEqual([
      { role: "user", parts: [{ text: "go" }] },
      {
        role: "model",
        parts: [
          {
            functionCall: { id: "c1", name: "get_weather", args: { a: 1 } },
            thoughtSignature: "skip_thought_signature_validator",
          },
        ],
      },
      { role: "user", parts: [response("c1", "bad"), response("c2", "x\ny")] },
    ]);
  });

  it("converts the input schema to the schema gemini takes", async () => {
    const converted = await parametersOf({
      type: "object",
      additionalProperties: false,
      properties: {
        a: { $ref: "#/$defs/A", description: "a" },
        b: { type: ["string", "null"] },
        c: { anyOf: [{ type: "integer" }, { type: "null" }] },
        d: { type: "integer", enum: [1, 2] },
        e: { type: "object" },
      },
      $defs: { A: { type: "string", enum: ["x", "y"] } },
    });

    const recursive = await parametersOf({
      type: "object",
      properties: { next: { $ref: "#/$defs/Node" } },
      $defs: { Node: { type: "object", properties: { next: { $ref: "#/$defs/Node" } } } },
    });

    expect(converted).toEqual([
      {
        functionDeclarations: [
          {
            name: "t",
            description: "d",
            parameters: {
              type: "object",
              properties: {
                a: { description: "a", type: "string", enum: ["x", "y"] },
                b: { anyOf: [{ type: "string" }], nullable: true },
                c: { nullable: true, type: "integer" },
                d: { type: "integer", format: "enum", enum: ["1", "2"] },
                e: { type: "object" },
              },
            },
          },
        ],
      },
    ]);

    expect(recursive).toEqual([
      {
        functionDeclarations: [
          {
            name: "t",
            description: "d",
            parametersJsonSchema: {
              type: "object",
              properties: { next: { $ref: "#/$defs/Node" } },
              $defs: { Node: { type: "object", properties: { next: { $ref: "#/$defs/Node" } } } },
            },
          },
        ],
      },
    ]);
  });

  it("refuses an enum whose values do not share one type before sending", async () => {
    const stream = google({ key: "k", fetch: () => Promise.reject(new Error("sent")) }).stream({
      model,
      tools: [
        {
          name: "t",
          description: "d",
          inputSchema: { type: "object", properties: { a: { enum: ["a", 1] } } },
        },
      ],
      messages: [{ role: "user", content: "hi" }],
    });

    await expect(stream[Symbol.asyncIterator]().next()).rejects.toMatchObject({
      kind: "unsupported",
    });
  });
});

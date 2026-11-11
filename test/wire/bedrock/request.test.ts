import { describe, expect, it } from "vitest";
import { text } from "../cases";
import fixture from "../fixtures/bedrock/text.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "us.anthropic.claude-haiku-4-5-20251001-v1:0";

const reasoning = { bedrock: { reasoningConfig: { type: "enabled", budgetTokens: 2048 } } };

describe("bedrock request", () => {
  it("sends the text case as the fixture's request", async () => {
    const { request, body } = await sentRequest({ ...text, model });

    expect(requestDiffs(fixture.request, request, body)).toEqual([]);
    expect(request.headers.get("authorization")).toBe("Bearer test-key");
  });

  it("posts to the encoded model under the given base url", async () => {
    const arn = "arn:aws:bedrock:us-east-1:123456789012:application-inference-profile/abc";
    const { request } = await sentRequest({ ...text, model: arn }, "https://gateway.test/");

    expect(request.url).toBe(
      "https://gateway.test/model/arn%3Aaws%3Abedrock%3Aus-east-1%3A123456789012%3Aapplication-inference-profile%2Fabc/converse-stream",
    );
  });

  it("turns its own reasoning config into anthropic thinking on top of the max tokens", async () => {
    const { body } = await sentRequest({
      ...text,
      model,
      maxOutputTokens: 64,
      providerOptions: { ...reasoning, openai: { reasoningEffort: "high" } },
    });

    expect(body.additionalModelRequestFields).toEqual({
      thinking: { type: "enabled", budget_tokens: 2048 },
    });

    expect(body.inferenceConfig).toEqual({ maxTokens: 2112 });
  });

  it("drops the thinking budget for a model that is not anthropic", async () => {
    const { body } = await sentRequest({
      ...text,
      model: "amazon.nova-lite-v1:0",
      maxOutputTokens: 64,
      providerOptions: reasoning,
    });

    expect(body).not.toHaveProperty("additionalModelRequestFields");
    expect(body).not.toHaveProperty("additionalModelResponseFieldPaths");
    expect(body.inferenceConfig).toEqual({ maxTokens: 64 });
  });

  it("joins messages of one role and trims the last assistant text", async () => {
    const { body } = await sentRequest({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "a" },
            { type: "text", text: "" },
          ],
        },
        { role: "user", content: "b" },
        { role: "assistant", content: [{ type: "text", text: "x " }] },
        { role: "assistant", content: "  " },
        { role: "user", content: " c " },
        { role: "assistant", content: " tail  " },
      ],
    });

    expect(body.system).toEqual([]);

    expect(body.messages).toEqual([
      { role: "user", content: [{ text: "a" }, { text: "b" }] },
      { role: "assistant", content: [{ text: "x " }] },
      { role: "user", content: [{ text: " c " }] },
      { role: "assistant", content: [{ text: "tail" }] },
    ]);
  });
});

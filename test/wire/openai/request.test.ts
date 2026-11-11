import { describe, expect, it } from "vitest";
import type { TextRequest } from "../../../src/types/text-request";
import { text } from "../cases";
import fixture from "../fixtures/openai/text.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "gpt-6-luna";

const withOptions = (request: TextRequest, providerOptions: TextRequest["providerOptions"]) => ({
  ...request,
  providerOptions,
});

describe("openai request", () => {
  it("sends the text case as the fixture's request", async () => {
    const { request, body } = await sentRequest({ ...text, model });

    expect(requestDiffs(fixture.request, request, body)).toEqual([]);
    expect(request.headers.get("authorization")).toBe("Bearer test-key");
  });

  it("posts to the responses path of the given base url", async () => {
    const { request } = await sentRequest(text, "https://chatgpt.com/backend-api/codex/");

    expect(request.url).toBe("https://chatgpt.com/backend-api/codex/responses");
  });

  it("sends system parts as developer items only to reasoning models", async () => {
    const roles = await Promise.all(
      ["gpt-6-luna", "o3", "gpt-5-chat-latest", "gpt-4o", "llama-4"].map(async (each) => {
        const { body } = await sentRequest({ ...text, model: each });

        return (body.input as { role: string }[])[0].role;
      }),
    );

    expect(roles).toEqual(["developer", "developer", "system", "system", "system"]);
  });

  it("reads its own provider options cell and sends reasoning only to reasoning models", async () => {
    const options = {
      openai: { reasoningEffort: "high", promptCacheKey: "u/t", passThroughUnsupportedFiles: true },
      anthropic: { cacheControl: { type: "ephemeral" } },
    };

    const reasoning = await sentRequest(
      withOptions({ ...text, model, maxOutputTokens: 64 }, options),
    );

    const plain = await sentRequest(withOptions({ ...text, model: "gpt-4o" }, options));

    const none = await sentRequest(
      withOptions({ ...text, model }, { openai: { reasoningEffort: "none" } }),
    );

    expect(reasoning.body).toMatchObject({
      max_output_tokens: 64,
      prompt_cache_key: "u/t",
      reasoning: { effort: "high", summary: "detailed" },
    });

    expect(Object.keys(reasoning.body)).toEqual([
      "model",
      "input",
      "max_output_tokens",
      "prompt_cache_key",
      "reasoning",
      "stream",
    ]);

    expect(plain.body).not.toHaveProperty("reasoning");
    expect(none.body.reasoning).toEqual({ effort: "none" });
  });

  it("drops empty text parts and sends each assistant text as its own item", async () => {
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
        {
          role: "assistant",
          content: [
            { type: "text", text: "x" },
            { type: "text", text: "" },
            { type: "text", text: "y" },
          ],
        },
      ],
    });

    expect(body.input).toEqual([
      { role: "user", content: [{ type: "input_text", text: "a" }] },
      { role: "assistant", content: [{ type: "output_text", text: "x" }] },
      { role: "assistant", content: [{ type: "output_text", text: "y" }] },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { text } from "../cases";
import fixture from "../fixtures/google/text.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "gemini-2.5-flash";

describe("google request", () => {
  it("sends the text case as the fixture's request", async () => {
    const { request, body } = await sentRequest({ ...text, model });

    expect(requestDiffs(fixture.request, request, body)).toEqual([]);
    expect(request.headers.get("x-goog-api-key")).toBe("test-key");
    expect(request.headers.has("authorization")).toBe(false);
  });

  it("posts to the model path under the given base url", async () => {
    const custom = await sentRequest({ ...text, model }, "https://gateway.test/v1beta/");
    const tuned = await sentRequest({ ...text, model: "tunedModels/mine" });

    expect(custom.request.url).toBe(
      "https://gateway.test/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse",
    );

    expect(tuned.request.url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/tunedModels/mine:streamGenerateContent?alt=sse",
    );
  });

  it("reads its own provider options cell into the generation config", async () => {
    const { body } = await sentRequest({
      ...text,
      model,
      maxOutputTokens: 64,
      providerOptions: {
        google: { thinkingConfig: { thinkingBudget: 0 }, audioTimestamp: false },
        openai: { reasoningEffort: "high" },
      },
    });

    expect(body.generationConfig).toEqual({
      maxOutputTokens: 64,
      thinkingConfig: { thinkingBudget: 0 },
    });
  });

  it("sends user text as user parts and assistant text as model parts", async () => {
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
        { role: "assistant", content: "" },
        { role: "user", content: "" },
      ],
    });

    expect(body).toEqual({
      generationConfig: {},
      contents: [
        { role: "user", parts: [{ text: "a" }] },
        { role: "model", parts: [{ text: "x" }, { text: "y" }] },
        { role: "model", parts: [] },
        { role: "user", parts: [{ text: "" }] },
      ],
    });
  });

  it("puts the system text before the first user text for gemma models", async () => {
    const { body } = await sentRequest({ ...text, model: "gemma-3-27b-it" });

    expect(body).toEqual({
      generationConfig: {},
      contents: [
        {
          role: "user",
          parts: [
            { text: "You are a terse assistant.\n\nAnswer in one short sentence.\n\n" },
            { text: "Name one planet in the solar system." },
          ],
        },
      ],
    });
  });
});

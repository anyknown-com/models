import { describe, expect, it } from "vitest";
import { openaiCompatible } from "../../../src/openai-compatible";
import { buildRequest } from "../../../src/openai-compatible/build-request";
import type { TextRequest } from "../../../src/types/text-request";
import { post } from "../../../src/wire/post";
import { text } from "../cases";
import type { Fixture } from "../fixture";
import textFixture from "../fixtures/openai-compatible/text.json";
import { replayFetch } from "../replay-fetch";

const CONFIG = { name: "openrouter", key: "k", baseUrl: "https://api.example.test/v1/" };

const sentAs = (fixture: Fixture, request: TextRequest) => {
  const { model } = fixture.request.body as { model: string };
  const baseUrl = fixture.request.url.replace(/\/chat\/completions$/, "");
  const config = { ...CONFIG, baseUrl };

  return post({
    provider: config.name,
    ...buildRequest(config, { ...request, model }),
    fetch: replayFetch(fixture),
    errorOf: (message) => ({ message }),
  });
};

describe("openai-compatible request", () => {
  it("sends each system part as a system message and the user text as a string", async () => {
    await expect(sentAs(textFixture as Fixture, text)).resolves.toBeInstanceOf(Response);
  });

  it("spreads its own provider options cell into the body and renames reasoningEffort", () => {
    const { url, body } = buildRequest(CONFIG, {
      model: "m",
      messages: [{ role: "user", content: "q" }],
      maxOutputTokens: 64,
      providerOptions: {
        openrouter: {
          reasoningEffort: "high",
          provider: { zdr: true, ignore: ["a"], max_price: { prompt: 1 } },
          session_id: "s",
        },
        anthropic: { cacheControl: { type: "ephemeral" } },
      },
    });

    expect(url).toBe("https://api.example.test/v1/chat/completions");
    expect(body).toEqual({
      model: "m",
      max_tokens: 64,
      reasoning_effort: "high",
      provider: { zdr: true, ignore: ["a"], max_price: { prompt: 1 } },
      session_id: "s",
      messages: [{ role: "user", content: "q" }],
      stream: true,
    });
  });

  it("sends user text parts as parts and joins the assistant text", () => {
    const { body } = buildRequest(CONFIG, {
      model: "m",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "a" },
            { type: "text", text: "" },
            { type: "text", text: "b" },
          ],
        },
        {
          role: "assistant",
          content: [
            { type: "text", text: "x" },
            { type: "text", text: "y" },
          ],
        },
      ],
    });

    expect(body.messages).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "a" },
          { type: "text", text: "b" },
        ],
      },
      { role: "assistant", content: "xy" },
    ]);
  });

  it("sends the key as a bearer token unless another auth header is named", () => {
    const request: TextRequest = { model: "m", messages: [] };

    expect(buildRequest(CONFIG, request).headers).toEqual({ authorization: "Bearer k" });
    expect(buildRequest({ ...CONFIG, authHeader: "api-key" }, request).headers).toEqual({
      "api-key": "k",
    });
  });

  it("names the adapter after the provider it is built for", () => {
    expect(openaiCompatible(CONFIG).provider).toBe("openrouter");
  });
});

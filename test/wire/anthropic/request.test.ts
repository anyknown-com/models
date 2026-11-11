import { describe, expect, it } from "vitest";
import type { TextRequest } from "../../../src/types/text-request";
import { text, textCache } from "../cases";
import fixture from "../fixtures/anthropic/text.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "claude-haiku-4-5";

const withAnthropic = (anthropic: TextRequest["providerOptions"]): TextRequest => ({
  ...text,
  model,
  providerOptions: anthropic,
});

describe("anthropic request", () => {
  it("sends the text-cache case as the fixture's request", async () => {
    const { request, body } = await sentRequest({ ...textCache, model });

    expect(requestDiffs(fixture.request, request, body)).toEqual([]);
    expect(request.headers.get("x-api-key")).toBe("test-key");
  });

  it("posts to the messages path of the given base url", async () => {
    const { request } = await sentRequest(text, "https://proxy.example/v1");

    expect(request.url).toBe("https://proxy.example/v1/messages");
  });

  it("takes max_tokens from the request, or the model's limit when it is not given", async () => {
    const given = await sentRequest({ ...text, model, maxOutputTokens: 1000 });
    const unknown = await sentRequest({ ...text, model: "model" });
    const newer = await sentRequest({ ...text, model: "claude-next-9" });

    expect([given, unknown, newer].map(({ body }) => body.max_tokens)).toEqual([
      1000, 4096, 128_000,
    ]);
  });

  it("sends the request's cacheControl as the top-level cache_control", async () => {
    const { body } = await sentRequest(
      withAnthropic({ anthropic: { cacheControl: { type: "ephemeral" } } }),
    );

    expect(body.cache_control).toEqual({ type: "ephemeral" });
  });

  it("puts a part's cacheControl on that block", async () => {
    const hour = { anthropic: { cacheControl: { type: "ephemeral", ttl: "1h" } } };

    const { body } = await sentRequest({
      model,
      system: [{ type: "text", text: "rules", providerOptions: hour }],
      messages: [{ role: "user", content: [{ type: "text", text: "hi", providerOptions: hour }] }],
    });

    expect(body.system).toEqual([
      { type: "text", text: "rules", cache_control: { type: "ephemeral", ttl: "1h" } },
    ]);

    expect(body.messages).toEqual([
      {
        role: "user",
        content: [{ type: "text", text: "hi", cache_control: { type: "ephemeral", ttl: "1h" } }],
      },
    ]);
  });

  it("sends a thinking budget and adds it to max_tokens up to the model's limit", async () => {
    const thinking = { type: "enabled", budgetTokens: 2000 };
    const sonnet = { ...withAnthropic({ anthropic: { thinking } }), model: "claude-sonnet-4-5" };
    const under = await sentRequest({ ...sonnet, maxOutputTokens: 4000 });
    const over = await sentRequest({ ...sonnet, maxOutputTokens: 63_000 });

    expect(under.body.thinking).toEqual({ type: "enabled", budget_tokens: 2000 });
    expect([under.body.max_tokens, over.body.max_tokens]).toEqual([6000, 64_000]);
  });

  it("sends adaptive thinking with the effort in output_config", async () => {
    const { body } = await sentRequest(
      withAnthropic({ anthropic: { thinking: { type: "adaptive" }, effort: "high" } }),
    );

    expect(body.thinking).toEqual({ type: "adaptive" });
    expect(body.output_config).toEqual({ effort: "high" });
    expect(body.max_tokens).toBe(64_000);
  });

  it("merges consecutive turns of one role and trims the last assistant text", async () => {
    const { body } = await sentRequest({
      model,
      messages: [
        { role: "user", content: "a" },
        { role: "user", content: "b" },
        { role: "assistant", content: "c " },
        { role: "assistant", content: "d " },
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
      {
        role: "assistant",
        content: [
          { type: "text", text: "c " },
          { type: "text", text: "d" },
        ],
      },
    ]);
  });
});

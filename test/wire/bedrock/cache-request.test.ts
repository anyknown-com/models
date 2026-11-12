import { describe, expect, it } from "vitest";
import { text, textCache } from "../cases";
import { sentRequest } from "./sent-request";

const model = "us.anthropic.claude-haiku-4-5-20251001-v1:0";

const cache = { bedrock: { cachePoint: { type: "default" } } };

const cacheHour = { bedrock: { cachePoint: { type: "default", ttl: "1h" } } };

describe("bedrock cache points", () => {
  it("ends the last message with a cache point for a request cache point", async () => {
    const { body } = await sentRequest({ ...textCache, model, providerOptions: cache });

    expect(body.system).toEqual(textCache.system?.map(({ text: part }) => ({ text: part })));
    expect(body.messages).toEqual([
      {
        role: "user",
        content: [
          { text: "Name one planet in the solar system." },
          { cachePoint: { type: "default" } },
        ],
      },
    ]);
  });

  it("puts a cache point after a marked system part", async () => {
    const { body } = await sentRequest({
      ...text,
      model,
      system: [
        { type: "text", text: "Rules.", providerOptions: cacheHour },
        { type: "text", text: "Be terse." },
      ],
    });

    expect(body.system).toEqual([
      { text: "Rules." },
      { cachePoint: { type: "default", ttl: "1h" } },
      { text: "Be terse." },
    ]);
  });

  it("puts a cache point after a marked part and a marked message, once each", async () => {
    const { body } = await sentRequest({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Long document.", providerOptions: cache },
            { type: "text", text: "Question?", providerOptions: cache },
          ],
          providerOptions: cache,
        },
        { role: "assistant", content: "Answer.", providerOptions: cache },
        { role: "user", content: "Next?" },
      ],
    });

    expect(body.messages).toEqual([
      {
        role: "user",
        content: [
          { text: "Long document." },
          { cachePoint: { type: "default" } },
          { text: "Question?" },
          { cachePoint: { type: "default" } },
        ],
      },
      { role: "assistant", content: [{ text: "Answer." }, { cachePoint: { type: "default" } }] },
      { role: "user", content: [{ text: "Next?" }] },
    ]);
  });

  it("sends no cache point without a bedrock cache point", async () => {
    const { body } = await sentRequest({ ...textCache, model });

    expect(JSON.stringify(body)).not.toContain("cachePoint");
  });
});

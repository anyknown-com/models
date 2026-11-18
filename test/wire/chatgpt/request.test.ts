import { describe, expect, it } from "vitest";
import { text, tools } from "../cases";
import fixture from "../fixtures/chatgpt/text.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "gpt-6-luna";

describe("chatgpt request", () => {
  it("sends the text case as the fixture's request with the subscription headers", async () => {
    const { request, body } = await sentRequest({ ...text, model });

    expect(requestDiffs(fixture.request, request, body)).toEqual([]);
    expect(request.headers.get("authorization")).toBe("Bearer test-token");
    expect(request.headers.get("chatgpt-account-id")).toBe("account-1");
  });

  it("reads its own options cell and never sends max_output_tokens", async () => {
    const { body } = await sentRequest({
      ...tools,
      system: text.system,
      model,
      maxOutputTokens: 64,
      providerOptions: { chatgpt: { reasoningEffort: "high", promptCacheKey: "u/t" } },
    });

    expect(Object.keys(body)).toEqual([
      "model",
      "instructions",
      "input",
      "prompt_cache_key",
      "reasoning",
      "tools",
      "tool_choice",
      "store",
      "stream",
    ]);

    expect(body.reasoning).toEqual({ effort: "high", summary: "detailed" });
    expect(body.input).not.toContainEqual(expect.objectContaining({ role: "developer" }));
  });
});

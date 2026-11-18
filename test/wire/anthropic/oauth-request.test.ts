import { describe, expect, it } from "vitest";
import { text, tools } from "../cases";
import fixture from "../fixtures/anthropic/oauth-text.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "claude-haiku-4-5";

describe("anthropic request with a subscription token", () => {
  it("sends the token as a bearer with the oauth beta and no api key", async () => {
    const { request, body } = await sentRequest({ ...text, model }, { token: "test-token" });

    expect(requestDiffs(fixture.request, request, body)).toEqual([]);
    expect(request.headers.get("authorization")).toBe("Bearer test-token");
    expect(request.headers.get("x-api-key")).toBeNull();
  });

  it("sends the same body as a key", async () => {
    const token = await sentRequest({ ...text, model }, { token: "test-token" });
    const key = await sentRequest({ ...text, model });

    expect(token.body).toEqual(key.body);
    expect(key.request.headers.get("x-api-key")).toBe("test-key");
    expect(key.request.headers.get("authorization")).toBeNull();
    expect(key.request.headers.get("anthropic-beta")).toBeNull();
  });

  it("adds the oauth beta to the betas the request needs", async () => {
    const { request } = await sentRequest({ ...tools, model }, { token: "test-token" });

    expect(request.headers.get("anthropic-beta")).toBe(
      "oauth-2025-04-20,structured-outputs-2025-11-13",
    );
  });
});

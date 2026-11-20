import { describe, expect, it } from "vitest";
import { CLAUDE_CODE_IDENTITY } from "../../../src/anthropic/constants";
import { text, tools } from "../cases";
import fixture from "../fixtures/anthropic/oauth-text.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "claude-haiku-4-5";

describe("anthropic request with a subscription token", () => {
  it("sends the token as a bearer with Claude Code's betas and headers and no api key", async () => {
    const { request, body } = await sentRequest({ ...text, model }, { token: "test-token" });

    expect(requestDiffs(fixture.request, request, body)).toEqual([]);
    expect(request.headers.get("authorization")).toBe("Bearer test-token");
    expect(request.headers.get("x-api-key")).toBeNull();
  });

  it("sends Claude Code's identity as its own first system block, then the key's body", async () => {
    const token = await sentRequest({ ...text, model }, { token: "test-token" });
    const key = await sentRequest({ ...text, model });
    const { system, ...rest } = key.body;

    expect(token.body).toEqual({
      ...rest,
      system: [{ type: "text", text: CLAUDE_CODE_IDENTITY }, ...(system as unknown[])],
    });
    expect(key.request.headers.get("x-api-key")).toBe("test-key");
    expect(key.request.headers.get("authorization")).toBeNull();
    expect(key.request.headers.get("anthropic-beta")).toBeNull();
    expect(key.request.headers.get("x-app")).toBeNull();
  });

  it("does not repeat the identity when the system already starts with it", async () => {
    const system = [{ type: "text" as const, text: CLAUDE_CODE_IDENTITY }, ...(text.system ?? [])];
    const { body } = await sentRequest({ ...text, model, system }, { token: "test-token" });

    expect(body.system).toEqual(fixture.request.body.system);
  });

  it("sends the identity block with no system of the caller", async () => {
    const { body } = await sentRequest({ ...text, model, system: [] }, { token: "test-token" });

    expect(body.system).toEqual([{ type: "text", text: CLAUDE_CODE_IDENTITY }]);
  });

  it("adds Claude Code's betas to the betas the request needs", async () => {
    const { request } = await sentRequest({ ...tools, model }, { token: "test-token" });

    expect(request.headers.get("anthropic-beta")).toBe(
      "claude-code-20250219,oauth-2025-04-20,structured-outputs-2025-11-13",
    );
  });
});

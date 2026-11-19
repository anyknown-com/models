import { describe, expect, it } from "vitest";
import { openai } from "../../../src/openai";
import { after, atNow, respond, textFailureOf } from "../reset-at";

const RATE_LIMIT = {
  error: { message: "Rate limit reached.", type: "tokens", code: "rate_limit_exceeded" },
};

const WINDOWS = {
  "x-ratelimit-reset-requests": "1s",
  "x-ratelimit-remaining-requests": "59",
  "x-ratelimit-reset-tokens": "6m0s",
  "x-ratelimit-remaining-tokens": "0",
};

describe("openai resetAt", () => {
  atNow();

  it("is now + 120 s for a 429 with retry-after: 120", async () => {
    const fetch = respond(429, RATE_LIMIT, { ...WINDOWS, "retry-after": "120" });
    const error = await textFailureOf(openai({ key: "k", fetch }));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: after(120) });
  });

  it("is the reset of the spent x-ratelimit window", async () => {
    const error = await textFailureOf(
      openai({ key: "k", fetch: respond(429, RATE_LIMIT, WINDOWS) }),
    );

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: after(360) });
  });

  it("is null for a 400 that carries x-ratelimit headers", async () => {
    const body = { error: { message: "bad", type: "invalid_request_error", code: null } };
    const error = await textFailureOf(openai({ key: "k", fetch: respond(400, body, WINDOWS) }));

    expect(error).toMatchObject({ kind: "bad-request", resetAt: null });
  });

  it("is null for a 429 with no reset header", async () => {
    const error = await textFailureOf(openai({ key: "k", fetch: respond(429, RATE_LIMIT) }));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: null });
  });
});

import { describe, expect, it } from "vitest";
import { anthropic } from "../../../src/anthropic";
import { RESETS, RESETS_ISO, after, atNow, respond, textFailureOf } from "../reset-at";

const RATE_LIMIT = {
  type: "error",
  error: {
    type: "rate_limit_error",
    message: "This request would exceed your account's rate limit. Please try again later.",
  },
};

describe("anthropic resetAt", () => {
  atNow();

  it("is now + 120 s for a 429 with retry-after: 120", async () => {
    const fetch = respond(429, RATE_LIMIT, { "retry-after": "120" });
    const error = await textFailureOf(anthropic({ key: "k", fetch }));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: after(120) });
  });

  it("is the reset of a Claude subscription's weekly limit", async () => {
    const fetch = respond(429, RATE_LIMIT, {
      "anthropic-ratelimit-unified-status": "rejected",
      "anthropic-ratelimit-unified-reset": String(RESETS),
      "anthropic-ratelimit-unified-representative-claim": "seven_day",
      "anthropic-ratelimit-unified-7d-status": "rejected",
      "anthropic-ratelimit-unified-7d-reset": String(RESETS),
    });

    const error = await textFailureOf(anthropic({ token: "t", fetch }));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: RESETS_ISO });
  });

  it("is the time in a Claude subscription's weekly-limit message", async () => {
    const message = `Claude AI usage limit reached|${RESETS}`;
    const fetch = respond(429, { ...RATE_LIMIT, error: { type: "rate_limit_error", message } });
    const error = await textFailureOf(anthropic({ token: "t", fetch }));

    expect(error).toMatchObject({ kind: "rate-limit", message, resetAt: RESETS_ISO });
  });

  it("is null for a 429 with no reset header", async () => {
    const error = await textFailureOf(anthropic({ key: "k", fetch: respond(429, RATE_LIMIT) }));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: null });
  });
});

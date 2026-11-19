import { describe, expect, it } from "vitest";
import { chatgpt } from "../../../src/chatgpt";
import { RESETS, RESETS_ISO, after, atNow, respond, textFailureOf } from "../reset-at";

// The shape of the Codex backend's 429 when a ChatGPT plan's usage limit is spent.
const usageLimit = (fields: Record<string, number>) => ({
  error: {
    type: "usage_limit_reached",
    message: "The usage limit has been reached",
    plan_type: "plus",
    limit_window_minutes: 10080,
    ...fields,
  },
});

const failureOf = (fetch: typeof globalThis.fetch) =>
  textFailureOf(chatgpt({ key: "k", accountId: "account-1", fetch }));

describe("chatgpt resetAt", () => {
  atNow();

  it("is resets_at of a usage limit", async () => {
    const error = await failureOf(
      respond(429, usageLimit({ resets_at: RESETS, resets_in_seconds: 4454 })),
    );

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: RESETS_ISO });
  });

  it("is now + resets_in_seconds when the usage limit has no resets_at", async () => {
    const error = await failureOf(respond(429, usageLimit({ resets_in_seconds: 4454 })));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: after(4454) });
  });

  it("is now + 120 s for a 429 with retry-after: 120", async () => {
    const error = await failureOf(respond(429, usageLimit({}), { "retry-after": "120" }));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: after(120) });
  });
});

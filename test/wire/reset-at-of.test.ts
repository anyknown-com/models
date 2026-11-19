import { describe, expect, it } from "vitest";
import { resetAtOf } from "../../src/wire/reset-at-of";
import { NOW, RESETS, RESETS_ISO, after } from "./reset-at";

const resetAt = (status: number, headers: Record<string, string>, body = "") =>
  resetAtOf(status, new Headers(headers), body, NOW);

describe("resetAtOf", () => {
  it.each([
    { name: "seconds", value: "120", expected: after(120) },
    { name: "an HTTP date", value: "Thu, 19 Nov 2026 01:00:00 GMT", expected: after(3600) },
    { name: "zero", value: "0", expected: after(0) },
  ])("reads retry-after as $name", ({ value, expected }) => {
    expect(resetAt(429, { "retry-after": value })).toBe(expected);
  });

  it("reads retry-after on a status other than 429", () => {
    expect(resetAt(503, { "retry-after": "30" })).toBe(after(30));
  });

  it.each<{ name: string; headers: Record<string, string> }>([
    { name: "no header", headers: {} },
    { name: "a retry-after it cannot read", headers: { "retry-after": "soon" } },
    { name: "a retry-after past Date's range", headers: { "retry-after": "9".repeat(20) } },
  ])("gives null for $name", ({ headers }) => {
    expect(resetAt(429, headers)).toBeNull();
  });

  it("takes the spent OpenAI window", () => {
    const headers = {
      "x-ratelimit-reset-requests": "1s",
      "x-ratelimit-remaining-requests": "59",
      "x-ratelimit-reset-tokens": "6m0s",
      "x-ratelimit-remaining-tokens": "0",
    };

    expect(resetAt(429, headers)).toBe(after(360));
    expect(resetAt(429, { ...headers, "x-ratelimit-remaining-tokens": "9" })).toBe(after(360));
    expect(
      resetAt(429, {
        ...headers,
        "x-ratelimit-remaining-requests": "0",
        "x-ratelimit-remaining-tokens": "9",
      }),
    ).toBe(after(1));
  });

  it.each([
    { value: "20ms", expected: after(0.02) },
    { value: "1h2m3.5s", expected: after(3723.5) },
    { value: "7.66", expected: after(7.66) },
  ])("reads the OpenAI reset $value", ({ value, expected }) => {
    expect(resetAt(429, { "x-ratelimit-reset-requests": value })).toBe(expected);
  });

  it("reads the Anthropic API key windows as RFC 3339", () => {
    const headers = {
      "anthropic-ratelimit-requests-reset": "2026-11-19T00:00:05Z",
      "anthropic-ratelimit-requests-remaining": "40",
      "anthropic-ratelimit-tokens-reset": "2026-11-19T00:00:50Z",
      "anthropic-ratelimit-tokens-remaining": "0",
    };

    expect(resetAt(429, headers)).toBe(after(50));
  });

  it("ignores the rate-limit windows of a response that is not a 429", () => {
    const headers = {
      "x-ratelimit-reset-tokens": "6m0s",
      "anthropic-ratelimit-tokens-reset": "2026-11-19T00:00:50Z",
    };

    expect(resetAt(400, headers)).toBeNull();
  });

  it("reads a Claude subscription's weekly limit from its unified headers", () => {
    const headers = {
      "anthropic-ratelimit-unified-status": "rejected",
      "anthropic-ratelimit-unified-reset": String(RESETS),
      "anthropic-ratelimit-unified-representative-claim": "seven_day",
      "anthropic-ratelimit-unified-5h-status": "allowed",
      "anthropic-ratelimit-unified-5h-reset": String(RESETS - 400_000),
      "anthropic-ratelimit-unified-7d-status": "rejected",
      "anthropic-ratelimit-unified-7d-reset": String(RESETS),
    };

    expect(resetAt(429, headers)).toBe(RESETS_ISO);
  });

  it("does not read a Claude subscription's unified windows while they allow", () => {
    const headers = {
      "anthropic-ratelimit-unified-status": "allowed",
      "anthropic-ratelimit-unified-reset": String(RESETS),
      "anthropic-ratelimit-unified-7d-reset": String(RESETS),
    };

    expect(resetAt(429, headers)).toBeNull();
  });

  it("reads the time in a Claude subscription's limit message", () => {
    const body = JSON.stringify({
      type: "error",
      error: { type: "rate_limit_error", message: `Claude AI usage limit reached|${RESETS}` },
    });

    expect(resetAt(429, {}, body)).toBe(RESETS_ISO);
    expect(resetAt(429, { "retry-after": "120" }, body)).toBe(RESETS_ISO);
  });

  it.each([
    { name: "resets_at", error: { resets_at: RESETS, resets_in_seconds: 5 }, expected: RESETS_ISO },
    { name: "resets_in_seconds", error: { resets_in_seconds: 4454 }, expected: after(4454) },
  ])("reads a ChatGPT usage limit's $name", ({ error, expected }) => {
    const body = JSON.stringify({ error: { type: "usage_limit_reached", ...error } });

    expect(resetAt(429, {}, body)).toBe(expected);
  });
});

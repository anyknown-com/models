import { describe, expect, it } from "vitest";
import { transcribe } from "../../../src";
import { groq } from "../../../src/groq";
import { after, atNow, failureOf, respond } from "../reset-at";

const RATE_LIMIT = {
  error: { message: "Rate limit reached.", type: "requests", code: "rate_limit_exceeded" },
};

const request = {
  model: "whisper-large-v3-turbo",
  audio: new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" }),
  filename: "a.webm",
};

const failure = (fetch: typeof globalThis.fetch) =>
  failureOf(transcribe(groq({ key: "k", fetch }), request));

describe("groq resetAt", () => {
  atNow();

  it("is now + 120 s for a 429 with retry-after: 120", async () => {
    const error = await failure(respond(429, RATE_LIMIT, { "retry-after": "120" }));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: after(120) });
  });

  it("is the reset of the spent x-ratelimit window", async () => {
    const error = await failure(
      respond(429, RATE_LIMIT, {
        "x-ratelimit-reset-requests": "2m59.56s",
        "x-ratelimit-remaining-requests": "0",
      }),
    );

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: after(179.56) });
  });

  it("is null for a 429 with no reset header", async () => {
    const error = await failure(respond(429, RATE_LIMIT));

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: null });
  });
});

import { describe, expect, it } from "vitest";
import { google } from "../../../src/google";
import { after, atNow, respond, textFailureOf } from "../reset-at";

const RESOURCE_EXHAUSTED = {
  error: {
    code: 429,
    message: "You exceeded your current quota, please check your plan and billing details.",
    status: "RESOURCE_EXHAUSTED",
    details: [
      { "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [] },
      { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "36s" },
    ],
  },
};

describe("google resetAt", () => {
  atNow();

  it("is now + retryDelay for a 429 with a RetryInfo detail", async () => {
    const error = await textFailureOf(
      google({ key: "k", fetch: respond(429, RESOURCE_EXHAUSTED) }),
    );

    expect(error).toMatchObject({ kind: "rate-limit", resetAt: after(36) });
  });
});

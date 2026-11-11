import { describe, expect, it } from "vitest";
import { ModelError } from "../../src/model-error";
import { post } from "../../src/wire/post";
import type { Fixture } from "./fixture";
import { replayFetch } from "./replay-fetch";

const ENDPOINT = "https://api.example.test/v1/chat";
const BODY = { model: "m", stream: true };

const fixtureOf = (response: Fixture["response"]): Fixture => ({
  request: {
    method: "POST",
    url: ENDPOINT,
    headers: { "content-type": "application/json", authorization: "Bearer k" },
    body: BODY,
  },
  response,
});

const errorResponse = (status: number, type: string, message: string) => ({
  status,
  headers: { "content-type": "application/json" },
  body: { error: { type, message } },
});

const errorOf = (body: string) => {
  const { error } = JSON.parse(body) as { error: { type: string; message: string } };

  return { code: error.type, message: error.message };
};

const postWith = (fetch: typeof globalThis.fetch, signal?: AbortSignal) =>
  post({
    provider: "example",
    url: ENDPOINT,
    headers: { authorization: "Bearer k" },
    body: BODY,
    fetch,
    errorOf,
    ...(signal === undefined ? {} : { signal }),
  });

const failureOf = async (promise: Promise<unknown>): Promise<ModelError> => {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );

  if (!(error instanceof ModelError)) throw new Error("expected a ModelError");

  return error;
};

describe("post", () => {
  it("returns the response on 2xx", async () => {
    const fixture = fixtureOf({ status: 200, headers: {}, chunks: ["data: hi\n\n"] });
    const response = await postWith(replayFetch(fixture));

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("data: hi\n\n");
  });

  it.each([
    [401, "auth", false, "authentication_error"],
    [429, "rate-limit", true, "rate_limit_error"],
    [500, "server", true, "api_error"],
  ] as const)("maps %i to %s", async (status, kind, retryable, code) => {
    const fixture = fixtureOf(errorResponse(status, code, `failed ${status}`));
    const error = await failureOf(postWith(replayFetch(fixture)));

    expect(error).toMatchObject({
      kind,
      retryable,
      status,
      code,
      provider: "example",
      message: `failed ${status}`,
      body: JSON.stringify({ error: { type: code, message: `failed ${status}` } }),
    });
  });

  it("maps a thrown fetch to network with the cause", async () => {
    const cause = new TypeError("connection reset");

    const error = await failureOf(
      postWith(() => {
        throw cause;
      }),
    );

    expect(error).toMatchObject({ kind: "network", retryable: false, cause });
  });

  it("maps a thrown fetch after abort to abort", async () => {
    const controller = new AbortController();
    const cause = new DOMException("aborted", "AbortError");

    controller.abort();

    const error = await failureOf(postWith(() => Promise.reject(cause), controller.signal));

    expect(error).toMatchObject({ kind: "abort", retryable: false, cause });
  });
});

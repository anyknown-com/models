import { describe, expect, it } from "vitest";
import type { JsonValue } from "../../src/types/json";
import type { Fixture } from "./fixture";
import echo from "./fixtures/echo.json";
import { replayFetch } from "./replay-fetch";

const fixture: Fixture = echo;
const recordedBody = { text: "hello" };

const send = (replay: typeof fetch, body: JsonValue) =>
  replay(fixture.request.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const chunksOf = async (response: Response) => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];

  for (let read = await reader?.read(); read && !read.done; read = await reader?.read()) {
    chunks.push(decoder.decode(read.value));
  }

  return chunks;
};

describe("replayFetch", () => {
  it("streams the recorded chunks in order for the same request", async () => {
    const response = await send(replayFetch(fixture), { text: "hello" });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(await chunksOf(response)).toEqual(echo.response.chunks);
  });

  it("returns the recorded body for the same request", async () => {
    const withBody: Fixture = {
      ...fixture,
      response: { status: 200, headers: {}, body: recordedBody },
    };

    const response = await send(replayFetch(withBody), { text: "hello" });

    expect(await response.json()).toEqual(recordedBody);
  });

  it("expands a $repeat marker before it compares the body", async () => {
    const withRepeat: Fixture = {
      ...fixture,
      request: { ...fixture.request, body: { text: { $repeat: " a", times: 3 } } },
    };

    const response = await send(replayFetch(withRepeat), { text: " a a a" });

    expect(response.status).toBe(200);
  });

  it("throws the differences when the body differs", async () => {
    await expect(send(replayFetch(fixture), { text: "bye" })).rejects.toThrow(
      'body: expected {"text":"hello"}, got {"text":"bye"}',
    );
  });
});

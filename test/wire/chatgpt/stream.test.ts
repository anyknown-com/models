import { describe, expect, it } from "vitest";
import { chatgpt } from "../../../src/chatgpt";
import type { StreamEvent } from "../../../src/types/stream-event";
import { text } from "../cases";
import type { Fixture } from "../fixture";
import json from "../fixtures/chatgpt/text.json";
import { replayFetch } from "../replay-fetch";

const fixture = json as Fixture;

describe("chatgpt stream", () => {
  it("reads a responses-shaped stream into text and the finish event", async () => {
    const adapter = chatgpt({ key: "k", accountId: "account-1", fetch: replayFetch(fixture) });
    const events: StreamEvent[] = [];

    for await (const event of adapter.stream({ ...text, model: "gpt-6-luna" })) events.push(event);

    const deltas = events.flatMap((event) => (event.type === "text" ? [event.delta] : []));

    expect(deltas.join("")).toBe("Mars.");
    expect(events.at(-1)).toMatchObject({ type: "finish", reason: "stop" });
  });
});

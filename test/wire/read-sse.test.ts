import { describe, expect, it } from "vitest";
import { readSse } from "../../src/wire/read-sse";

const SOURCE = [
  ": keep-alive",
  "event: message_start",
  'data: {"text":"你好 🌏"}',
  "",
  "data: first line\r",
  "data:second line\r",
  "\r",
  ":comment between events",
  "",
  "event: ping",
  "id: 7",
  "data: [DONE]",
].join("\n");

const EXPECTED = [
  { event: "message_start", data: '{"text":"你好 🌏"}' },
  { data: "first line\nsecond line" },
  { event: "ping", data: "[DONE]" },
];

const streamOf = (chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });

const eventsOf = async (chunks: Uint8Array[]) => {
  const events = [];

  for await (const event of readSse(streamOf(chunks))) events.push(event);

  return events;
};

describe("readSse", () => {
  const bytes = new TextEncoder().encode(SOURCE);

  it("reads every event from one whole chunk", async () => {
    expect(await eventsOf([bytes])).toStrictEqual(EXPECTED);
  });

  it("reads the same events when every byte is its own chunk", async () => {
    const singleBytes = Array.from(bytes, (byte) => Uint8Array.of(byte));

    expect(await eventsOf(singleBytes)).toStrictEqual(EXPECTED);
  });
});

import { describe, expect, it } from "vitest";
import { crc32 } from "../../../src/bedrock/crc32";
import { readEventStream } from "../../../src/bedrock/read-event-stream";
import { frame, header, stringHeader, u16, u32 } from "./frames";

const encoder = new TextEncoder();

const CHUNK_PAYLOAD = '{"contentBlockIndex":0,"delta":{"text":"你好 🌏"},"p":"abcd"}';

const EXCEPTION_PAYLOAD = '{"message":"Too many requests, please wait before trying again."}';

const CHUNK = frame(
  [
    ...stringHeader(":event-type", "contentBlockDelta"),
    ...stringHeader(":content-type", "application/json"),
    ...stringHeader(":message-type", "event"),
  ],
  CHUNK_PAYLOAD,
);

const EXCEPTION = frame(
  [
    ...header("flag-true", 0, []),
    ...header("flag-false", 1, []),
    ...header("byte", 2, [0x7f]),
    ...header("short", 3, u16(512)),
    ...stringHeader(":exception-type", "throttlingException"),
    ...header("integer", 4, u32(70_000)),
    ...header("long", 5, [...u32(0), ...u32(1)]),
    ...header("bytes", 6, [...u16(3), 1, 2, 3]),
    ...header("timestamp", 8, [...u32(0x18c), ...u32(0x8f0d1800)]),
    ...header(
      "uuid",
      9,
      Array.from({ length: 16 }, (_, i) => i),
    ),
    ...stringHeader(":content-type", "application/json"),
    ...stringHeader(":message-type", "exception"),
  ],
  EXCEPTION_PAYLOAD,
);

const EXPECTED = [
  {
    headers: {
      ":event-type": "contentBlockDelta",
      ":content-type": "application/json",
      ":message-type": "event",
    },
    payload: CHUNK_PAYLOAD,
  },
  {
    headers: {
      ":exception-type": "throttlingException",
      ":content-type": "application/json",
      ":message-type": "exception",
    },
    payload: EXCEPTION_PAYLOAD,
  },
];

const streamOf = (chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });

const framesOf = async (chunks: Uint8Array[]) => {
  const decoder = new TextDecoder();
  const frames = [];

  for await (const { headers, payload } of readEventStream(streamOf(chunks))) {
    frames.push({ headers, payload: decoder.decode(payload) });
  }

  return frames;
};

describe("crc32", () => {
  it("matches the IEEE check value", () => {
    expect(crc32(encoder.encode("123456789"))).toBe(0xcbf43926);
  });
});

describe("readEventStream", () => {
  const bytes = Uint8Array.from([...CHUNK, ...EXCEPTION]);

  it("reads both frames from one whole chunk", async () => {
    expect(await framesOf([bytes])).toStrictEqual(EXPECTED);
  });

  it("reads the same frames when every byte is its own chunk", async () => {
    expect(await framesOf(Array.from(bytes, (byte) => Uint8Array.of(byte)))).toStrictEqual(
      EXPECTED,
    );
  });

  it("keeps only the string headers", async () => {
    const [, exception] = await framesOf([bytes]);

    expect(Object.keys(exception.headers)).toStrictEqual([
      ":exception-type",
      ":content-type",
      ":message-type",
    ]);
  });

  it.each([
    ["the prelude", 2],
    ["the headers", 20],
    ["the payload", CHUNK.length - 10],
    ["the message checksum", CHUNK.length - 1],
  ])("throws a network error when one byte of %s changes", async (_, at) => {
    const broken = bytes.slice();

    broken[at] ^= 0x01;

    await expect(framesOf([broken])).rejects.toMatchObject({
      name: "ModelError",
      kind: "network",
      provider: "bedrock",
    });
  });

  it("throws a network error when the stream ends inside a frame", async () => {
    await expect(framesOf([bytes.slice(0, -1)])).rejects.toMatchObject({
      name: "ModelError",
      kind: "network",
    });
  });
});

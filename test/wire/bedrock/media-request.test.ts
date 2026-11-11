import { describe, expect, it } from "vitest";
import { bedrock } from "../../../src/bedrock";
import type { FilePart, ImagePart } from "../../../src/types/parts";
import type { TextRequest } from "../../../src/types/text-request";
import { base64Of } from "../../../src/wire/base64";
import { file, fileDocx, image } from "../cases";
import type { Fixture } from "../fixture";
import fileDocxJson from "../fixtures/bedrock/file-docx.json";
import fileJson from "../fixtures/bedrock/file.json";
import imageJson from "../fixtures/bedrock/image.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "us.anthropic.claude-haiku-4-5-20251001-v1:0";
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 1]);
const PDF = new TextEncoder().encode("%PDF-1.4");
const TEXT = new TextEncoder().encode("hello");

const bytes = (data: Uint8Array) => ({ bytes: base64Of(data) });

const asking = (...parts: (ImagePart | FilePart)[]): TextRequest => ({
  model,
  tools: [{ name: "look", description: "Look.", inputSchema: { type: "object" } }],
  messages: [
    { role: "user", content: parts },
    {
      role: "assistant",
      content: [{ type: "tool-call", toolCallId: "c1", toolName: "look", input: {} }],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "c1",
          toolName: "look",
          output: { type: "content", value: parts },
        },
      ],
    },
  ],
});

const refusal = (part: ImagePart | FilePart) => {
  const stream = bedrock({
    key: "k",
    baseUrl: "https://b.test",
    fetch: () => Promise.reject(new Error("sent")),
  }).stream({
    model,
    messages: [{ role: "user", content: [part] }],
  });

  return stream[Symbol.asyncIterator]().next();
};

describe("bedrock media request", () => {
  it("sends the image, file and docx cases as the fixtures' requests", async () => {
    for (const [request, fixture] of [
      [image, imageJson],
      [file, fileJson],
      [fileDocx, fileDocxJson],
    ] as const) {
      const sent = await sentRequest({ ...request, model });

      expect(
        requestDiffs((fixture as unknown as Fixture).request, sent.request, sent.body),
      ).toEqual([]);
    }
  });

  it("sniffs user images, keeps tool result types and numbers unnamed documents", async () => {
    const { body } = await sentRequest(
      asking(
        { type: "image", image: JPEG, mediaType: "image/png" },
        { type: "file", data: PDF, mediaType: "application" },
        { type: "file", data: TEXT, mediaType: "text/plain", filename: "notes.v2.txt" },
        { type: "file", data: PDF, mediaType: "video/mp4" },
      ),
    );

    const blocks = (format: string, first: number) => [
      { image: { format, source: bytes(JPEG) } },
      { document: { format: "pdf", name: `document-${first}`, source: bytes(PDF) } },
      { document: { format: "txt", name: "notes", source: bytes(TEXT) } },
      { video: { format: "mp4", source: bytes(PDF) } },
    ];

    expect(body.messages).toEqual([
      { role: "user", content: blocks("jpeg", 1) },
      expect.anything(),
      { role: "user", content: [{ toolResult: { toolUseId: "c1", content: blocks("png", 2) } }] },
    ]);
  });

  it("reads a data url as bytes with its own media type", async () => {
    const { body } = await sentRequest({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: new URL(`data:text/plain;base64,${base64Of(TEXT)}`),
              mediaType: "application/pdf",
              filename: "a.txt",
            },
          ],
        },
      ],
    });

    expect(body.messages).toEqual([
      { role: "user", content: [{ document: { format: "txt", name: "a", source: bytes(TEXT) } }] },
    ]);
  });

  it("refuses links, unknown media types and types bedrock has no format for", async () => {
    const refused = [
      { type: "image", image: new URL("https://example.com/a.png") },
      { type: "image", image: new URL("s3://bucket/a.png"), mediaType: "image/png" },
      { type: "image", image: TEXT, mediaType: "image/svg+xml" },
      { type: "file", data: TEXT, mediaType: "application" },
      { type: "file", data: TEXT, mediaType: "audio/mpeg" },
    ] satisfies (ImagePart | FilePart)[];

    for (const part of refused) {
      await expect(refusal(part)).rejects.toMatchObject({ kind: "unsupported" });
    }
  });
});

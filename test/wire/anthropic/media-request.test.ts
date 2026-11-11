import { describe, expect, it } from "vitest";
import { anthropic } from "../../../src/anthropic";
import type { ModelMessage } from "../../../src/types/model-message";
import type { FilePart, ImagePart, TextPart } from "../../../src/types/parts";
import { bytesOfBase64 } from "../../../src/wire/base64";
import { file, image } from "../cases";
import type { Fixture } from "../fixture";
import fileJson from "../fixtures/anthropic/file.json";
import imageJson from "../fixtures/anthropic/image.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const model = "claude-haiku-4-5";
const ephemeral = { anthropic: { cacheControl: { type: "ephemeral" } } };
const png = bytesOfBase64("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQ");
const pdf = new TextEncoder().encode("%PDF-1.4");

const pngSource = {
  type: "base64",
  media_type: "image/png",
  data: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQ",
};

const pdfSource = { type: "base64", media_type: "application/pdf", data: "JVBERi0xLjQ=" };

const userTurn = (...content: (TextPart | ImagePart | FilePart)[]): ModelMessage[] => [
  { role: "user", content },
];

const toolTurn = (...value: (TextPart | ImagePart | FilePart)[]): ModelMessage[] => [
  { role: "user", content: "go" },
  {
    role: "assistant",
    content: [{ type: "tool-call", toolCallId: "c1", toolName: "t", input: {} }],
  },
  {
    role: "tool",
    content: [
      { type: "tool-result", toolCallId: "c1", toolName: "t", output: { type: "content", value } },
    ],
  },
];

const lastContentOf = async (messages: ModelMessage[]) => {
  const { body } = await sentRequest({ model, messages });

  return Array.isArray(body.messages) ? body.messages.at(-1) : undefined;
};

describe("anthropic image and file request", () => {
  it("sends the image and file cases as the fixtures' requests", async () => {
    for (const [request, fixture] of [
      [image, imageJson],
      [file, fileJson],
    ] as const) {
      const { request: sent, body } = await sentRequest({ ...request, model });

      expect(requestDiffs((fixture as unknown as Fixture).request, sent, body)).toEqual([]);
    }
  });

  it("sniffs image bytes, decodes data urls and sends http urls as they are", async () => {
    const last = await lastContentOf(
      userTurn(
        { type: "image", image: png, mediaType: "image/jpeg" },
        { type: "image", image: new URL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQ") },
        { type: "image", image: new URL("https://example.com/a.png") },
        { type: "file", data: new URL("https://example.com/a.pdf"), mediaType: "application/pdf" },
        {
          type: "file",
          data: new TextEncoder().encode("hi"),
          mediaType: "text/plain",
          filename: "a.txt",
        },
      ),
    );

    expect(last).toEqual({
      role: "user",
      content: [
        { type: "image", source: pngSource },
        { type: "image", source: pngSource },
        { type: "image", source: { type: "url", url: "https://example.com/a.png" } },
        { type: "document", source: { type: "url", url: "https://example.com/a.pdf" } },
        {
          type: "document",
          source: { type: "text", media_type: "text/plain", data: "hi" },
          title: "a.txt",
        },
      ],
    });
  });

  it("sends images and PDFs in tool results, drops other files and asks for the PDF beta", async () => {
    const { request, body } = await sentRequest({
      model,
      messages: toolTurn(
        { type: "image", image: png },
        { type: "file", data: pdf, mediaType: "application/pdf", filename: "a.pdf" },
        { type: "file", data: pdf, mediaType: "text/plain" },
      ),
    });

    expect(request.headers.get("anthropic-beta")).toBe("pdfs-2024-09-25");

    expect(Array.isArray(body.messages) && body.messages.at(-1)).toEqual({
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: "c1",
          content: [
            { type: "image", source: pngSource },
            { type: "document", source: pdfSource },
          ],
        },
      ],
    });
  });

  it("throws unsupported for a file type or url the wire does not take", async () => {
    const parts: (ImagePart | FilePart)[] = [
      { type: "file", data: pdf, mediaType: "application/msword" },
      { type: "file", data: new URL("https://example.com/a.txt"), mediaType: "text/plain" },
      { type: "image", image: new Uint8Array([1, 2, 3]) },
    ];

    for (const part of parts) {
      const stream = anthropic({ key: "k", fetch }).stream({ model, messages: userTurn(part) });

      await expect(stream[Symbol.asyncIterator]().next()).rejects.toMatchObject({
        kind: "unsupported",
      });
    }
  });

  it("drops file parts in assistant turns", async () => {
    const { body } = await sentRequest({
      model,
      messages: [
        { role: "user", content: "a" },
        {
          role: "assistant",
          content: [
            { type: "text", text: "b" },
            { type: "file", data: pdf, mediaType: "application/pdf" },
          ],
        },
        { role: "user", content: "c" },
      ],
    });

    expect(Array.isArray(body.messages) && body.messages[1]).toEqual({
      role: "assistant",
      content: [{ type: "text", text: "b" }],
    });
  });

  it("puts a message's cacheControl on its last part unless that part has its own", async () => {
    const hour = { anthropic: { cacheControl: { type: "ephemeral", ttl: "1h" } } };

    const { body } = await sentRequest({
      model,
      messages: [
        {
          role: "user",
          providerOptions: ephemeral,
          content: [
            { type: "text", text: "a" },
            { type: "image", image: png, mediaType: "image/png" },
          ],
        },
        {
          role: "assistant",
          providerOptions: ephemeral,
          content: [
            { type: "text", text: "b" },
            { type: "reasoning", text: "r" },
          ],
        },
        {
          role: "user",
          providerOptions: ephemeral,
          content: [{ type: "text", text: "c", providerOptions: hour }],
        },
      ],
    });

    expect(body.messages).toEqual([
      {
        role: "user",
        content: [
          { type: "text", text: "a" },
          { type: "image", source: pngSource, cache_control: { type: "ephemeral" } },
        ],
      },
      { role: "assistant", content: [{ type: "text", text: "b" }] },
      {
        role: "user",
        content: [{ type: "text", text: "c", cache_control: { type: "ephemeral", ttl: "1h" } }],
      },
    ]);
  });
});

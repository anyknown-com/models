import { describe, expect, it } from "vitest";
import { google } from "../../../src/google";
import type { FilePart, ImagePart, TextPart } from "../../../src/types/parts";
import type { TextRequest } from "../../../src/types/text-request";
import { file, image } from "../cases";
import type { Fixture } from "../fixture";
import fileJson from "../fixtures/google/file.json";
import imageJson from "../fixtures/google/image.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const imageFixture = imageJson as unknown as Fixture;
const fileFixture = fileJson as unknown as Fixture;
const model = "gemini-2.5-flash";
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1]);
const pngBase64 = "iVBORwE=";

const userWith = (...parts: (ImagePart | FilePart)[]): TextRequest => ({
  model,
  messages: [{ role: "user", content: parts }],
});

const toolWith = (toolModel: string, value: (TextPart | ImagePart | FilePart)[]): TextRequest => ({
  model: toolModel,
  messages: [
    {
      role: "assistant",
      content: [{ type: "tool-call", toolCallId: "c1", toolName: "shot", input: {} }],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "c1",
          toolName: "shot",
          output: { type: "content", value },
        },
      ],
    },
  ],
});

const toolParts = async (toolModel: string, value: (TextPart | ImagePart | FilePart)[]) => {
  const { body } = await sentRequest(toolWith(toolModel, value));

  return (body.contents as { parts: unknown }[])[1]?.parts;
};

const response = (content: string) => ({
  id: "c1",
  name: "shot",
  response: { name: "shot", content },
});

describe("google media request", () => {
  it("sends the image and file cases as the fixtures' requests", async () => {
    const sentImage = await sentRequest({ ...image, model });
    const sentFile = await sentRequest({ ...file, model });

    expect(requestDiffs(imageFixture.request, sentImage.request, sentImage.body)).toEqual([]);
    expect(requestDiffs(fileFixture.request, sentFile.request, sentFile.body)).toEqual([]);
  });

  it("sends user bytes inline under the sniffed type and links as they are", async () => {
    const { body } = await sentRequest(
      userWith(
        { type: "image", image: png, mediaType: "image/jpeg" },
        { type: "image", image: new URL(`data:image;base64,${pngBase64}`) },
        { type: "image", image: new URL("https://example.com/a.png"), mediaType: "image/png" },
        { type: "file", data: new URL("http://example.com/a.pdf"), mediaType: "application/pdf" },
      ),
    );

    expect(body.contents).toEqual([
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/png", data: pngBase64 } },
          { inlineData: { mimeType: "image/png", data: pngBase64 } },
          { fileData: { mimeType: "image/png", fileUri: "https://example.com/a.png" } },
          { fileData: { mimeType: "application/pdf", fileUri: "http://example.com/a.pdf" } },
        ],
      },
    ]);
  });

  it("refuses a link that is not http and a type it cannot complete", async () => {
    const refused = [
      userWith({
        type: "file",
        data: new URL("ftp://example.com/a.pdf"),
        mediaType: "application/pdf",
      }),
      userWith({ type: "image", image: new URL("https://example.com/a.png") }),
      userWith({ type: "file", data: new Uint8Array([1]), mediaType: "application" }),
    ];

    for (const request of refused) {
      const stream = google({ key: "k", fetch: () => Promise.reject(new Error("sent")) }).stream(
        request,
      );

      await expect(stream[Symbol.asyncIterator]().next()).rejects.toMatchObject({
        kind: "unsupported",
      });
    }
  });

  it("puts tool result media beside the response before gemini 3 and inside it after", async () => {
    const value: (TextPart | ImagePart | FilePart)[] = [
      { type: "text", text: "done" },
      { type: "image", image: png, mediaType: "image/png" },
      { type: "image", image: new URL("https://example.com/a.png") },
    ];

    const linkText = JSON.stringify({
      type: "file",
      data: { type: "url", url: "https://example.com/a.png" },
      mediaType: "image",
    });

    expect(await toolParts(model, value)).toEqual([
      { functionResponse: response("done") },
      { inlineData: { mimeType: "image/png", data: pngBase64 } },
      { text: "Tool executed successfully and returned this image as a response" },
      { text: linkText },
    ]);

    expect(await toolParts("gemini-3-pro-preview", value)).toEqual([
      {
        functionResponse: {
          ...response(`done\n${linkText}`),
          parts: [{ inlineData: { mimeType: "image/png", data: pngBase64 } }],
        },
      },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { ModelError } from "../../../src/model-error";
import { buildRequest } from "../../../src/openai/build-request";
import type { FilePart, ImagePart, TextPart } from "../../../src/types/parts";
import type { TextRequest } from "../../../src/types/text-request";
import { file, fileDocx, image } from "../cases";
import type { Fixture } from "../fixture";
import fileDocxJson from "../fixtures/openai/file-docx.json";
import fileJson from "../fixtures/openai/file.json";
import imageJson from "../fixtures/openai/image.json";
import { requestDiffs } from "../request-diffs";
import { sentRequest } from "./sent-request";

const CALL = { provider: "openai", key: "k", fetch, baseUrl: "https://api.example.test/v1" };
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1]);
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PASS = { openai: { passThroughUnsupportedFiles: true } };

type Part = TextPart | ImagePart | FilePart;

const inputOf = (request: TextRequest) =>
  buildRequest(CALL, request).body.input as { content?: unknown[]; output?: unknown[] }[];

const userParts = (parts: Part[], providerOptions?: TextRequest["providerOptions"]) =>
  inputOf({ model: "gpt-4o", messages: [{ role: "user", content: parts }], providerOptions })[0]
    .content;

const toolParts = (parts: Part[]) =>
  inputOf({
    model: "gpt-4o",
    messages: [
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "c1",
            toolName: "read",
            output: { type: "content", value: parts },
          },
        ],
      },
    ],
  })[0].output;

const inputImage = (image_url: string) => ({ type: "input_image", image_url });

describe("openai image and file parts", () => {
  it.each([
    ["image", image, imageJson],
    ["file", file, fileJson],
    ["file-docx", fileDocx, fileDocxJson],
  ])("sends the %s case as the fixture's request", async (_, request, json) => {
    const { request: sent, body } = await sentRequest({ ...request, model: "gpt-6-luna" });

    expect(requestDiffs((json as unknown as Fixture).request, sent, body)).toEqual([]);
  });

  it("takes the image media type from the bytes, reads data urls and sends links as they are", () => {
    expect(
      userParts([
        { type: "image", image: PNG, mediaType: "image/jpeg" },
        { type: "image", image: new URL("data:image/jpeg;base64,AQ==") },
        { type: "image", image: new URL("https://example.test/a.png") },
        { type: "file", data: new URL("https://example.test/a.pdf"), mediaType: "application/pdf" },
        { type: "file", data: new URL("https://example.test/a.docx"), mediaType: DOCX },
      ]),
    ).toEqual([
      inputImage("data:image/png;base64,iVBORwE="),
      inputImage("data:image/jpeg;base64,AQ=="),
      inputImage("https://example.test/a.png"),
      { type: "input_file", file_url: "https://example.test/a.pdf" },
      { type: "input_file", file_url: "https://example.test/a.docx" },
    ]);
  });

  it("names unnamed files by position and sends non-PDF bytes only with pass-through", () => {
    const docx: FilePart = { type: "file", data: new Uint8Array([1]), mediaType: DOCX };

    expect(
      userParts(
        [
          { type: "text", text: "" },
          { type: "text", text: "q" },
          { type: "file", data: PDF, mediaType: "application/pdf" },
          docx,
        ],
        PASS,
      ),
    ).toEqual([
      { type: "input_text", text: "q" },
      {
        type: "input_file",
        filename: "part-1.pdf",
        file_data: "data:application/pdf;base64,JVBERg==",
      },
      { type: "input_file", filename: "part-2", file_data: `data:${DOCX};base64,AQ==` },
    ]);
    expect(() => userParts([docx])).toThrow(ModelError);
    expect(() => userParts([{ type: "image", image: new Uint8Array([1]) }])).toThrow(ModelError);
  });

  it("keeps declared types, links and any file in tool result content", () => {
    expect(
      toolParts([
        { type: "image", image: PNG, mediaType: "image/jpeg" },
        { type: "image", image: PNG },
        {
          type: "file",
          data: new URL("data:application/pdf;base64,JVBERg=="),
          mediaType: "application/pdf",
        },
        { type: "file", data: new Uint8Array([1]), mediaType: DOCX },
      ]),
    ).toEqual([
      inputImage("data:image/jpeg;base64,iVBORwE="),
      inputImage("data:image/png;base64,iVBORwE="),
      { type: "input_file", file_url: "data:application/pdf;base64,JVBERg==" },
      { type: "input_file", filename: "data", file_data: `data:${DOCX};base64,AQ==` },
    ]);
  });

  it("refuses links that are not http, https or data in user and tool result content", () => {
    const ftpParts: Part[] = [
      { type: "image", image: new URL("ftp://example.test/a.png") },
      { type: "file", data: new URL("ftp://example.test/a.pdf"), mediaType: "application/pdf" },
    ];

    for (const part of ftpParts) {
      expect(() => userParts([part])).toThrow(expect.objectContaining({ kind: "unsupported" }));
      expect(() => toolParts([part])).toThrow(expect.objectContaining({ kind: "unsupported" }));
    }
  });
});

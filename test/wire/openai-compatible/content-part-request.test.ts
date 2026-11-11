import { describe, expect, it } from "vitest";
import { ModelError } from "../../../src/model-error";
import { buildRequest } from "../../../src/openai-compatible/build-request";
import type { FilePart, ImagePart } from "../../../src/types/parts";

const CONFIG = { name: "openrouter", key: "k", baseUrl: "https://api.example.test/v1" };
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1]);
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

const partOf = (part: ImagePart | FilePart) => {
  const { body } = buildRequest(CONFIG, {
    model: "m",
    messages: [{ role: "user", content: [{ type: "text", text: "q" }, part] }],
  });

  return (body.messages as { content: unknown[] }[])[0].content[1];
};

const imageUrl = (url: string) => ({ type: "image_url", image_url: { url } });

describe("openai-compatible image and file parts", () => {
  it("takes the image media type from the bytes and sends URLs as they are", () => {
    expect(partOf({ type: "image", image: PNG, mediaType: "image/jpeg" })).toEqual(
      imageUrl("data:image/png;base64,iVBORwE="),
    );
    expect(partOf({ type: "image", image: new URL("https://example.test/a.png") })).toEqual(
      imageUrl("https://example.test/a.png"),
    );
  });

  it("sends image files as images and PDFs with a default filename", () => {
    expect(partOf({ type: "file", data: PNG, mediaType: "image/png" })).toEqual(
      imageUrl("data:image/png;base64,iVBORwE="),
    );
    expect(partOf({ type: "file", data: PDF, mediaType: "application/pdf" })).toEqual({
      type: "file",
      file: { filename: "document.pdf", file_data: "data:application/pdf;base64,JVBERg==" },
    });
  });

  it("rejects image bytes without a subtype, PDF links and other media types", () => {
    const pdfLink = new URL("https://example.test/a.pdf");

    expect(() => partOf({ type: "image", image: new Uint8Array([1]) })).toThrow(ModelError);
    expect(() => partOf({ type: "file", data: pdfLink, mediaType: "application/pdf" })).toThrow(
      ModelError,
    );
    expect(() =>
      partOf({ type: "file", data: new Uint8Array([1]), mediaType: "application/msword" }),
    ).toThrow(ModelError);
  });
});

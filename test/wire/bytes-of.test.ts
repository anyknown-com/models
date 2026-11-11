import { describe, expect, it } from "vitest";
import { base64Of, bytesOfBase64 } from "../../src/wire/base64";
import { bytesOf } from "../../src/wire/bytes-of";

const PNG_HEAD = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("base64", () => {
  it("round-trips every byte value", () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);

    expect(bytesOfBase64(base64Of(bytes))).toEqual(bytes);
  });

  it("round-trips input larger than one chunk", () => {
    const bytes = Uint8Array.from({ length: 100_003 }, (_, i) => (i * 31) % 256);

    expect(bytesOfBase64(base64Of(bytes))).toEqual(bytes);
  });

  it("matches the standard alphabet with padding", () => {
    expect(base64Of(new TextEncoder().encode("hi?"))).toBe("aGk/");
    expect(base64Of(new TextEncoder().encode("hi"))).toBe("aGk=");
    expect(base64Of(new Uint8Array())).toBe("");
  });
});

describe("bytesOf", () => {
  it("keeps bytes and the part's media type", () => {
    expect(bytesOf(PNG_HEAD, "image/png")).toEqual({ bytes: PNG_HEAD, mediaType: "image/png" });
    expect(bytesOf(PNG_HEAD)).toEqual({ bytes: PNG_HEAD, mediaType: undefined });
  });

  it("decodes a base64 data URL and takes its media type", () => {
    const url = new URL(`data:image/png;base64,${base64Of(PNG_HEAD)}`);

    expect(bytesOf(url)).toEqual({ bytes: PNG_HEAD, mediaType: "image/png" });
  });

  it("prefers the part's media type over the data URL's", () => {
    const url = new URL(`data:application/octet-stream;base64,${base64Of(PNG_HEAD)}`);

    expect(bytesOf(url, "image/png")).toEqual({ bytes: PNG_HEAD, mediaType: "image/png" });
  });

  it("decodes a percent-encoded data URL with parameters", () => {
    const url = new URL("data:text/plain;charset=utf-8,h%C3%A9llo%20world");

    expect(bytesOf(url)).toEqual({
      bytes: new TextEncoder().encode("héllo world"),
      mediaType: "text/plain",
    });
  });

  it("leaves the media type empty when the data URL has none", () => {
    expect(bytesOf(new URL("data:,abc"))).toEqual({
      bytes: new TextEncoder().encode("abc"),
      mediaType: undefined,
    });
  });

  it("keeps http and https URLs as URLs", () => {
    const https = new URL("https://example.test/cat.png");
    const http = new URL("http://example.test/doc.pdf");

    expect(bytesOf(https, "image/png")).toEqual({ url: https });
    expect(bytesOf(http)).toEqual({ url: http });
  });
});

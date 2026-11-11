import { describe, expect, it } from "vitest";
import { generateImage } from "../../../src";
import { openai } from "../../../src/openai";
import type { ImageRequest } from "../../../src/types/image-request";
import { bytesOfBase64 } from "../../../src/wire/base64";
import { draw, redraw } from "../cases";
import type { Fixture } from "../fixture";
import generation from "../fixtures/openai/image.json";
import edit from "../fixtures/openai/image-edit.json";
import { replayFetch } from "../replay-fetch";

const MODEL = "gpt-image-2.5-sunburst";

const generate = (fixture: Fixture, request: ImageRequest) =>
  generateImage(openai({ key: "test-key", fetch: replayFetch(fixture) }), {
    ...request,
    model: MODEL,
  });

const editedImage = (): Uint8Array => {
  const dataUrl = edit.request.body.images[0].image_url;

  return bytesOfBase64(dataUrl.slice(dataUrl.indexOf(",") + 1));
};

const rejected: Fixture = {
  ...(generation as Fixture),
  response: {
    status: 400,
    headers: { "content-type": "application/json" },
    body: {
      error: {
        message: "Your request was rejected by the safety system.",
        type: "image_generation_user_error",
        code: "moderation_blocked",
      },
    },
  },
};

describe("openai image", () => {
  it("sends a prompt without images as the fixture's generation request", async () => {
    await expect(generate(generation as Fixture, draw)).resolves.toBeDefined();
  });

  it("sends a prompt with image bytes as the fixture's edit request with a data url", async () => {
    const request = { ...redraw, images: [{ type: "image" as const, image: editedImage() }] };

    await expect(generate(edit as Fixture, request)).resolves.toBeDefined();
  });

  it("throws a bad-request model error with the provider's code on a 400", async () => {
    await expect(generate(rejected, draw)).rejects.toMatchObject({
      name: "ModelError",
      kind: "bad-request",
      status: 400,
      code: "moderation_blocked",
    });
  });
});

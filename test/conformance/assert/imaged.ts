import { expect } from "vitest";
import type { ImageRequest } from "../../../src/types/image-request";
import type { ImageResult } from "../../../src/types/image-result";
import type { SpeechRun } from "../speech/types";

export function imaged({ result, error }: SpeechRun<ImageRequest, ImageResult>) {
  const image = result?.image;

  expect(error).toBeUndefined();
  expect(image instanceof URL || (image?.byteLength ?? 0) > 0).toBe(true);
  expect(result?.usage.unit).toBe("images");
}

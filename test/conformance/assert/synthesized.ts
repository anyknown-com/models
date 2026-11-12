import { expect } from "vitest";
import type { SynthesizeRequest, SynthesizeResult } from "../../../src/types/synthesize-request";
import type { SpeechRun } from "../speech/types";

const lengthIn = (unit: string, text: string) =>
  unit === "bytes" ? new TextEncoder().encode(text).length : text.length;

export async function synthesized({
  request,
  result,
  error,
}: SpeechRun<SynthesizeRequest, SynthesizeResult>) {
  expect(error).toBeUndefined();
  expect(result?.audio.ok).toBe(true);
  expect((await result?.audio.arrayBuffer())?.byteLength).toBeGreaterThan(0);
  expect(["characters", "bytes"]).toContain(result?.usage.unit);
  expect(result?.usage.amount).toBe(lengthIn(result?.usage.unit ?? "", request.text));
}

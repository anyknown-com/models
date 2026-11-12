import { expect } from "vitest";
import type { TranscribeRequest, TranscribeResult } from "../../../src/types/transcribe-request";
import type { SpeechRun } from "../speech/types";

export function transcribed({ result, error }: SpeechRun<TranscribeRequest, TranscribeResult>) {
  expect(error).toBeUndefined();
  expect(result?.text.trim()).not.toBe("");
  expect(result?.usage.unit).toBe("seconds");
  expect(result?.usage.amount).toBeGreaterThan(0);
}

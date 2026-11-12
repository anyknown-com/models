import { expect } from "vitest";
import type { SpeechRun } from "../speech/types";

export const speechErrorLike =
  (expected: Record<string, unknown>) =>
  ({ error }: SpeechRun<unknown, unknown>) => {
    expect(error).toMatchObject(expected);
  };

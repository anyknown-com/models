import { expect } from "vitest";
import type { VideoJobState } from "../cases";
import type { VideoRun } from "../visual/types";

const FAILED = { status: "failed", error: { name: "ModelError" } };

export const videoStatusIs =
  (state: VideoJobState) =>
  ({ status, error }: VideoRun) => {
    expect(error).toBeUndefined();
    expect(status).toMatchObject(state === "failed" ? FAILED : { status: state });
  };

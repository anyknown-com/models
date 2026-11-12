import { expect } from "vitest";
import type { VideoResult } from "../../../src/types/video-result";
import type { VideoRun } from "../visual/types";

const sizeOf = async (video: VideoResult["video"] | undefined) => {
  if (video instanceof URL) return 1;
  if (video instanceof Response) return (await video.arrayBuffer()).byteLength;

  return video?.byteLength ?? 0;
};

export async function videoMade({ job, status, result, error }: VideoRun) {
  expect(error).toBeUndefined();
  expect(job?.id).toMatch(/\S/);
  expect(status?.status).toBe("succeeded");
  expect(await sizeOf(result?.video)).toBeGreaterThan(0);
  expect(result?.usage.unit).toBe("seconds");
}

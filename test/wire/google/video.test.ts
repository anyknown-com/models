import { describe, expect, it } from "vitest";
import { readVideoResult, readVideoStatus, submitVideo } from "../../../src";
import { google } from "../../../src/google";
import type { VideoJob } from "../../../src/types/video-job";
import { film, recut } from "../cases";
import type { Fixture } from "../fixture";
import edit from "../fixtures/google/video-edit.json";
import status from "../fixtures/google/video-status.json";
import submit from "../fixtures/google/video-submit.json";
import { replayFetch } from "../replay-fetch";

const MODEL = "gemini-omni-1.2-flash";

const job: VideoJob = { provider: "google", id: "v1_unverifiedSubmit01" };

const foreign: VideoJob = { provider: "openai", id: "video_1" };

const adapterOf = (fixture: Fixture) => google({ key: "test-key", fetch: replayFetch(fixture) });

const refusingFetch: typeof fetch = async () => {
  throw new Error("no request expected");
};

const offline = google({ key: "test-key", fetch: refusingFetch });

const unsupported = { name: "ModelError", kind: "unsupported" };

describe("google video", () => {
  it("submits a prompt as the fixture's background interaction", async () => {
    const request = { ...film, model: MODEL };

    await expect(submitVideo(adapterOf(submit as Fixture), request)).resolves.toBeDefined();
  });

  it("submits a source job as the fixture's edit of the previous interaction", async () => {
    const request = { ...recut, model: MODEL, source: job };

    await expect(submitVideo(adapterOf(edit as Fixture), request)).resolves.toBeDefined();
  });

  it("reads the status with the fixture's get of the interaction", async () => {
    await expect(readVideoStatus(adapterOf(status as Fixture), job)).resolves.toBeDefined();
  });

  it("reads the result with the fixture's get of the interaction", async () => {
    await expect(readVideoResult(adapterOf(status as Fixture), job)).resolves.toBeDefined();
  });

  it("rejects a job of another provider without a request", async () => {
    await expect(readVideoStatus(offline, foreign)).rejects.toMatchObject(unsupported);
    await expect(readVideoResult(offline, foreign)).rejects.toMatchObject(unsupported);
  });

  it("rejects a source of another provider without a request", async () => {
    const request = { ...recut, model: MODEL, source: foreign };

    await expect(submitVideo(offline, request)).rejects.toMatchObject(unsupported);
  });
});

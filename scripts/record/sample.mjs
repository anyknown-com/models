import { readFileSync } from "node:fs";

export const SAMPLE_FILENAME = "sample.wav";

export const sampleAudio = () =>
  new Blob([readFileSync(new URL("../sample.wav", import.meta.url))], { type: "audio/wav" });

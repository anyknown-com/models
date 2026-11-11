import { readFileSync } from "node:fs";

export const sampleAudio = () =>
  new Blob([readFileSync(new URL("../../../scripts/sample.wav", import.meta.url))], {
    type: "audio/wav",
  });

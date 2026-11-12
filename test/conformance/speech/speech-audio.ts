import type { SpeechAudio } from "../cases";

const NOISE = "not audio";

export const speechAudio = (audio: SpeechAudio, sample: () => Blob): Blob =>
  audio === "sample" ? sample() : new Blob([NOISE], { type: "audio/wav" });

import sampleWav from "../../../scripts/sample.wav?inline";

const bytes = Uint8Array.from(atob(sampleWav.split(",")[1]!), (char) => char.charCodeAt(0));

export const sampleAudio = () => new Blob([bytes], { type: "audio/wav" });

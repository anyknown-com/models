import { recordCall } from "./record/record-call.mjs";
import { transportOf } from "./record/transport.mjs";
import { SAMPLE_FILENAME, sampleAudio } from "./record/sample.mjs";

const BASE = "https://api.fish.audio";
const FIXTURES = new URL("../test/wire/fixtures/fish-audio/", import.meta.url);

const { key, fetch } = await transportOf({
  provider: "fish-audio",
  base: BASE,
  keyEnv: "FISH_AUDIO_API_KEY",
});

const transcribeInput = { model: "transcribe-1-pro", filename: SAMPLE_FILENAME, language: "en" };
const form = new FormData();

form.set("audio", sampleAudio(), SAMPLE_FILENAME);
form.set("language", transcribeInput.language);

await recordCall({
  file: new URL("recorded-transcribe.json", FIXTURES),
  key,
  fetch,
  input: transcribeInput,
  request: new Request(`${BASE}/v1/asr`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, model: transcribeInput.model },
    body: form,
  }),
});

const synthesizeInput = {
  model: "s2.1-pro",
  text: "Hello from Anyknown.",
  voice: "9a9cf47702da476aa4629e2506d4a857",
};

await recordCall({
  file: new URL("recorded-synthesize.json", FIXTURES),
  key,
  fetch,
  input: synthesizeInput,
  request: new Request(`${BASE}/v1/tts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      model: synthesizeInput.model,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: synthesizeInput.text,
      reference_id: synthesizeInput.voice,
      format: "mp3",
    }),
  }),
});

import { recordCall } from "./record/record-call.mjs";
import { SAMPLE_FILENAME, sampleAudio } from "./record/sample.mjs";

const BASE = "https://api.elevenlabs.io/v1";
const FIXTURES = new URL("../test/wire/fixtures/elevenlabs/", import.meta.url);
const key = process.env.ELEVENLABS_API_KEY;

if (!key) throw new Error("ELEVENLABS_API_KEY is not set");

const transcribeInput = { model: "scribe_v2", filename: SAMPLE_FILENAME, language: "en" };
const form = new FormData();

form.set("file", sampleAudio(), SAMPLE_FILENAME);
form.set("model_id", transcribeInput.model);
form.set("language_code", transcribeInput.language);

await recordCall({
  file: new URL("recorded-transcribe.json", FIXTURES),
  key,
  input: transcribeInput,
  request: new Request(`${BASE}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  }),
});

const synthesizeInput = {
  model: "eleven_flash_v2_5",
  text: "Hello from Anyknown.",
  voice: "21m00Tcm4TlvDq8ikWAM",
};

await recordCall({
  file: new URL("recorded-synthesize.json", FIXTURES),
  key,
  input: synthesizeInput,
  request: new Request(
    `${BASE}/text-to-speech/${synthesizeInput.voice}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({ text: synthesizeInput.text, model_id: synthesizeInput.model }),
    },
  ),
});

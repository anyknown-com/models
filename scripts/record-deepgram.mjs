import { recordCall } from "./record/record-call.mjs";
import { SAMPLE_FILENAME, sampleAudio } from "./record/sample.mjs";

const BASE = "https://api.deepgram.com/v1";
const FIXTURES = new URL("../test/wire/fixtures/deepgram/", import.meta.url);
const key = process.env.DEEPGRAM_API_KEY;

if (!key) throw new Error("DEEPGRAM_API_KEY is not set");

const input = { model: "nova-3", filename: SAMPLE_FILENAME, language: "en" };
const audio = sampleAudio();

const query = new URLSearchParams({
  model: input.model,
  smart_format: "true",
  language: input.language,
});

await recordCall({
  file: new URL("recorded-transcribe.json", FIXTURES),
  key,
  input,
  request: new Request(`${BASE}/listen?${query}`, {
    method: "POST",
    headers: { authorization: `Token ${key}`, "content-type": audio.type },
    body: audio,
  }),
});

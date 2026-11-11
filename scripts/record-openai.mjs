import { recordCall } from "./record/record-call.mjs";
import { SAMPLE_FILENAME, sampleAudio } from "./record/sample.mjs";

const BASE = "https://api.openai.com/v1";
const FIXTURES = new URL("../test/wire/fixtures/openai/", import.meta.url);
const key = process.env.OPENAI_API_KEY;

if (!key) throw new Error("OPENAI_API_KEY is not set");

const transcribeInput = { model: "gpt-transcribe", filename: SAMPLE_FILENAME, language: "en" };
const form = new FormData();

form.set("file", sampleAudio(), SAMPLE_FILENAME);
form.set("model", transcribeInput.model);
form.set("response_format", "json");
form.append("languages[]", "en");

await recordCall({
  file: new URL("recorded-transcribe.json", FIXTURES),
  key,
  input: transcribeInput,
  request: new Request(`${BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}` },
    body: form,
  }),
});

const synthesizeInput = { model: "gpt-4o-mini-tts", text: "Hello from Anyknown.", voice: "alloy" };

await recordCall({
  file: new URL("recorded-synthesize.json", FIXTURES),
  key,
  input: synthesizeInput,
  request: new Request(`${BASE}/audio/speech`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      model: synthesizeInput.model,
      input: synthesizeInput.text,
      voice: synthesizeInput.voice,
      response_format: "mp3",
    }),
  }),
});

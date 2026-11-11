import { recordCall } from "./record/record-call.mjs";
import { SAMPLE_FILENAME, sampleAudio } from "./record/sample.mjs";

const BASE = "https://api.groq.com/openai/v1";
const FIXTURES = new URL("../test/wire/fixtures/groq/", import.meta.url);
const key = process.env.GROQ_API_KEY;

if (!key) throw new Error("GROQ_API_KEY is not set");

const input = { model: "whisper-large-v3-turbo", filename: SAMPLE_FILENAME, language: "en" };
const form = new FormData();

form.set("file", sampleAudio(), SAMPLE_FILENAME);
form.set("model", input.model);
form.set("response_format", "verbose_json");
form.set("language", input.language);

await recordCall({
  file: new URL("recorded-transcribe.json", FIXTURES),
  key,
  input,
  request: new Request(`${BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}` },
    body: form,
  }),
});

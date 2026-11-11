import { recordCall } from "./record/record-call.mjs";
import { transportOf } from "./record/transport.mjs";
import { SAMPLE_FILENAME, sampleAudio } from "./record/sample.mjs";

const BASE = "https://api.groq.com/openai/v1";
const FIXTURES = new URL("../test/wire/fixtures/groq/", import.meta.url);

const { key, fetch } = await transportOf({ provider: "groq", base: BASE, keyEnv: "GROQ_API_KEY" });

const input = { model: "whisper-large-v3-turbo", filename: SAMPLE_FILENAME, language: "en" };
const form = new FormData();

form.set("file", sampleAudio(), SAMPLE_FILENAME);
form.set("model", input.model);
form.set("response_format", "verbose_json");
form.set("language", input.language);

await recordCall({
  file: new URL("recorded-transcribe.json", FIXTURES),
  key,
  fetch,
  input,
  request: new Request(`${BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}` },
    body: form,
  }),
});

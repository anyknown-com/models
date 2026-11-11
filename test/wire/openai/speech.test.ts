import { describe, expect, it } from "vitest";
import { synthesize, transcribe } from "../../../src";
import { openai } from "../../../src/openai";
import synthesizeSpeech from "../fixtures/openai/synthesize-speech.json";
import gptTranscribeUsageSeconds from "../fixtures/openai/transcribe-gpt-transcribe-usage-seconds.json";
import languageOnly from "../fixtures/openai/transcribe-language-only.json";
import languageUnknownTag from "../fixtures/openai/transcribe-language-unknown-tag.json";
import languagesAll from "../fixtures/openai/transcribe-languages-all.json";
import languagesEmpty from "../fixtures/openai/transcribe-languages-empty.json";
import languagesInOrder from "../fixtures/openai/transcribe-languages-in-order.json";
import languagesUnknownTag from "../fixtures/openai/transcribe-languages-unknown-tag.json";
import noTerms from "../fixtures/openai/transcribe-no-terms.json";
import notJson from "../fixtures/openai/transcribe-not-json.json";
import promptBudget from "../fixtures/openai/transcribe-prompt-budget.json";
import promptTerms from "../fixtures/openai/transcribe-prompt-terms.json";
import unauthorized from "../fixtures/openai/transcribe-unauthorized.json";
import unknownBody from "../fixtures/openai/transcribe-unknown-body.json";
import whisperFirstSubtag from "../fixtures/openai/transcribe-whisper-first-subtag.json";
import whisperNoLanguage from "../fixtures/openai/transcribe-whisper-no-language.json";
import whisperVerboseJson from "../fixtures/openai/transcribe-whisper-verbose-json.json";
import recordedSynthesize from "../fixtures/openai/synthesize-real.json";
import recordedTranscribe from "../fixtures/openai/transcribe-real.json";
import { outcomeOf } from "../speech/outcome-of";
import { playFixture } from "../speech/play-fixture";
import { sampleAudio } from "../speech/sample-audio";
import type { SynthesizeFixture, TranscribeFixture } from "../speech/types";

const KEY = "<key>";
const audio = () => new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });

const transcribeCases: Record<string, TranscribeFixture> = {
  "whisper-1 asks for verbose_json and reads duration": whisperVerboseJson,
  "whisper-1 without a language sends no language": whisperNoLanguage,
  "whisper-1 keeps the first subtag of the language": whisperFirstSubtag,
  "gpt-transcribe asks for json and reads usage.seconds": gptTranscribeUsageSeconds,
  "gpt-transcribe sends languages[] in order and no language": languagesInOrder,
  "gpt-transcribe maps every known tag": languagesAll,
  "gpt-transcribe sends one languages[] for a lone language": languageOnly,
  "gpt-transcribe sends no language when one tag is unknown": languagesUnknownTag,
  "gpt-transcribe sends no language for an unknown lone tag": languageUnknownTag,
  "gpt-transcribe sends no language for an empty list": languagesEmpty,
  "terms join into the prompt with 、": promptTerms,
  "the prompt stops at 224 bytes": promptBudget,
  "no terms send no prompt": noTerms,
  "an unknown body is empty text with no seconds": unknownBody,
  "a 401 carries error.message and error.code": unauthorized,
  "a 2xx body that is not json is a server error": notJson,
};

describe("openai transcribe", () => {
  it.each(Object.entries(transcribeCases))("%s", async (_, fixture) => {
    const played = playFixture(fixture);
    const adapter = openai({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(transcribe(adapter, { ...fixture.input, audio: audio() }));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.unverified ? outcome : (fixture.result ?? fixture.error));
  });

  it("a fetch that throws is a network error", async () => {
    const adapter = openai({ key: KEY, fetch: () => Promise.reject(new TypeError("offline")) });
    const run = transcribe(adapter, { model: "whisper-1", audio: audio(), filename: "a.webm" });

    await expect(run).rejects.toMatchObject({
      kind: "network",
      status: undefined,
      retryable: true,
    });
  });

  it("an aborted signal is an abort error", async () => {
    const controller = new AbortController();

    controller.abort();

    const adapter = openai({ key: KEY, fetch: (_, init) => Promise.reject(init?.signal?.reason) });
    const request = { model: "whisper-1", audio: audio(), filename: "a.webm" };
    const run = transcribe(adapter, { ...request, signal: controller.signal });

    await expect(run).rejects.toMatchObject({ kind: "abort", status: undefined, retryable: false });
  });
});

describe("openai synthesize", () => {
  it("sends the json body and the mp3 headers and counts characters", async () => {
    const fixture: SynthesizeFixture = synthesizeSpeech;
    const played = playFixture(fixture);
    const adapter = openai({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(synthesize(adapter, fixture.input));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.unverified ? outcome : fixture.result);
  });
});

describe("openai recorded transcribe", () => {
  it("replays the real transcription of sample.wav", async () => {
    const fixture: TranscribeFixture = recordedTranscribe;
    const played = playFixture(fixture);
    const adapter = openai({ key: KEY, fetch: played.fetch });

    const outcome = await outcomeOf(
      transcribe(adapter, { ...fixture.input, audio: sampleAudio() }),
    );

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.result);
  });
});

describe("openai recorded synthesize", () => {
  it("reads the real 401 missing_scope", async () => {
    const fixture: SynthesizeFixture = recordedSynthesize;
    const played = playFixture(fixture);
    const adapter = openai({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(synthesize(adapter, fixture.input));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.result ?? fixture.error);
  });
});

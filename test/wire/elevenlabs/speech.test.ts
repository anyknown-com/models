import { describe, expect, it } from "vitest";
import { synthesize, transcribe } from "../../../src";
import { elevenlabs } from "../../../src/elevenlabs";
import synthesizeVoicePath from "../fixtures/elevenlabs/synthesize-voice-path.json";
import jaJpFirstSubtag from "../fixtures/elevenlabs/transcribe-ja-jp-first-subtag.json";
import keytermsMax from "../fixtures/elevenlabs/transcribe-keyterms-max.json";
import keytermsSkipRejected from "../fixtures/elevenlabs/transcribe-keyterms-skip-rejected.json";
import keyterms from "../fixtures/elevenlabs/transcribe-keyterms.json";
import modelId from "../fixtures/elevenlabs/transcribe-model-id.json";
import noTerms from "../fixtures/elevenlabs/transcribe-no-terms.json";
import noWords from "../fixtures/elevenlabs/transcribe-no-words.json";
import notJson from "../fixtures/elevenlabs/transcribe-not-json.json";
import unauthorized from "../fixtures/elevenlabs/transcribe-unauthorized.json";
import zhTwZho from "../fixtures/elevenlabs/transcribe-zh-tw-zho.json";
import recordedSynthesize from "../fixtures/elevenlabs/synthesize-real.json";
import recordedTranscribe from "../fixtures/elevenlabs/transcribe-real.json";
import { outcomeOf } from "../speech/outcome-of";
import { playFixture } from "../speech/play-fixture";
import { sampleAudio } from "../speech/sample-audio";
import type { SynthesizeFixture, TranscribeFixture } from "../speech/types";

const KEY = "<key>";
const audio = () => new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });

const transcribeCases: Record<string, TranscribeFixture> = {
  "xi-api-key, model_id, language_code and the last word's end": modelId,
  "zh-TW sends zho": zhTwZho,
  "ja-JP sends ja": jaJpFirstSubtag,
  "one keyterms part per term and no prompt": keyterms,
  "keyterms skip the too long, the too many words and < > { } [ ] \\": keytermsSkipRejected,
  "keyterms stop at 1000": keytermsMax,
  "no terms send no keyterms": noTerms,
  "no words is no seconds": noWords,
  "a 401 carries detail.message and detail.status": unauthorized,
  "a 2xx body that is not json is a server error": notJson,
};

describe("elevenlabs transcribe", () => {
  it.each(Object.entries(transcribeCases))("%s", async (_, fixture) => {
    const played = playFixture(fixture);
    const adapter = elevenlabs({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(transcribe(adapter, { ...fixture.input, audio: audio() }));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.unverified ? outcome : (fixture.result ?? fixture.error));
  });
});

describe("elevenlabs synthesize", () => {
  it("puts the voice in the path with output_format and counts characters", async () => {
    const fixture: SynthesizeFixture = synthesizeVoicePath;
    const played = playFixture(fixture);
    const adapter = elevenlabs({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(synthesize(adapter, fixture.input));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.unverified ? outcome : fixture.result);
  });
});

describe("elevenlabs recorded transcribe", () => {
  it("replays the real transcription of sample.wav", async () => {
    const fixture: TranscribeFixture = recordedTranscribe;
    const played = playFixture(fixture);
    const adapter = elevenlabs({ key: KEY, fetch: played.fetch });

    const outcome = await outcomeOf(
      transcribe(adapter, { ...fixture.input, audio: sampleAudio() }),
    );

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.result);
  });
});

describe("elevenlabs recorded synthesize", () => {
  it("counts characters of the real mp3 reply", async () => {
    const fixture: SynthesizeFixture = recordedSynthesize;
    const played = playFixture(fixture);
    const adapter = elevenlabs({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(synthesize(adapter, fixture.input));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.result ?? fixture.error);
  });
});

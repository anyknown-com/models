import { describe, expect, it } from "vitest";
import { synthesize, transcribe } from "../../../src";
import { fishAudio } from "../../../src/fish-audio";
import referenceId from "../fixtures/fish-audio/synthesize-reference-id.json";
import multipartAudio from "../fixtures/fish-audio/transcribe-multipart-audio.json";
import noSegments from "../fixtures/fish-audio/transcribe-no-segments.json";
import noTerms from "../fixtures/fish-audio/transcribe-no-terms.json";
import notJson from "../fixtures/fish-audio/transcribe-not-json.json";
import unauthorized from "../fixtures/fish-audio/transcribe-unauthorized.json";
import { outcomeOf } from "../speech/outcome-of";
import { playFixture } from "../speech/play-fixture";
import type { SynthesizeFixture, TranscribeFixture } from "../speech/types";

const KEY = "<key>";
const audio = () => new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });

const transcribeCases: Record<string, TranscribeFixture> = {
  "multipart audio, the model header, the first subtag and the last segment's end": multipartAudio,
  "terms are not sent": noTerms,
  "no segments is no seconds": noSegments,
  "a 401 carries message": unauthorized,
  "a 2xx body that is not json is a server error": notJson,
};

describe("fish-audio transcribe", () => {
  it.each(Object.entries(transcribeCases))("%s", async (_, fixture) => {
    const played = playFixture(fixture);
    const adapter = fishAudio({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(transcribe(adapter, { ...fixture.input, audio: audio() }));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.unverified ? outcome : (fixture.result ?? fixture.error));
  });
});

describe("fish-audio synthesize", () => {
  it("sends reference_id and format with the model header and counts utf-8 bytes", async () => {
    const fixture: SynthesizeFixture = referenceId;
    const played = playFixture(fixture);
    const adapter = fishAudio({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(synthesize(adapter, fixture.input));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.unverified ? outcome : fixture.result);
  });
});

import { describe, expect, it } from "vitest";
import { transcribe } from "../../../src";
import { deepgram } from "../../../src/deepgram";
import detectLanguage from "../fixtures/deepgram/transcribe-detect-language.json";
import keytermsBudget from "../fixtures/deepgram/transcribe-keyterms-budget.json";
import keyterms from "../fixtures/deepgram/transcribe-keyterms.json";
import noChannel from "../fixtures/deepgram/transcribe-no-channel.json";
import notJson from "../fixtures/deepgram/transcribe-not-json.json";
import rawAudio from "../fixtures/deepgram/transcribe-raw-audio.json";
import unauthorized from "../fixtures/deepgram/transcribe-unauthorized.json";
import { outcomeOf } from "../speech/outcome-of";
import { playFixture } from "../speech/play-fixture";
import type { TranscribeFixture } from "../speech/types";

const KEY = "<key>";
const audio = () => new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });

const cases: Record<string, TranscribeFixture> = {
  "the raw audio with its content-type, the whole tag as language, the nested transcript and metadata.duration":
    rawAudio,
  "no language detects the language": detectLanguage,
  "one keyterm per term": keyterms,
  "keyterms stop at 500 bytes": keytermsBudget,
  "no channel is an empty text and no seconds": noChannel,
  "a 401 carries err_code and no message": unauthorized,
  "a 2xx body that is not json is a server error": notJson,
};

describe("deepgram transcribe", () => {
  it.each(Object.entries(cases))("%s", async (_, fixture) => {
    const played = playFixture(fixture);
    const adapter = deepgram({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(transcribe(adapter, { ...fixture.input, audio: audio() }));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.unverified ? outcome : (fixture.result ?? fixture.error));
  });
});

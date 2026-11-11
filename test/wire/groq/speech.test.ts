import { describe, expect, it } from "vitest";
import { transcribe } from "../../../src";
import { groq } from "../../../src/groq";
import firstSubtag from "../fixtures/groq/transcribe-first-subtag.json";
import noSegments from "../fixtures/groq/transcribe-no-segments.json";
import notJson from "../fixtures/groq/transcribe-not-json.json";
import openaiShape from "../fixtures/groq/transcribe-openai-shape.json";
import unauthorized from "../fixtures/groq/transcribe-unauthorized.json";
import { outcomeOf } from "../speech/outcome-of";
import { playFixture } from "../speech/play-fixture";
import type { TranscribeFixture } from "../speech/types";

const KEY = "<key>";
const audio = () => new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });

const cases: Record<string, TranscribeFixture> = {
  "the openai shape at groq's base as verbose_json, with the prompt and the last segment's end":
    openaiShape,
  "the language keeps its first subtag": firstSubtag,
  "no segments is no seconds": noSegments,
  "a 401 carries error.message and error.code": unauthorized,
  "a 2xx body that is not json is a server error": notJson,
};

describe("groq transcribe", () => {
  it.each(Object.entries(cases))("%s", async (_, fixture) => {
    const played = playFixture(fixture);
    const adapter = groq({ key: KEY, fetch: played.fetch });
    const outcome = await outcomeOf(transcribe(adapter, { ...fixture.input, audio: audio() }));

    expect(played.requests).toEqual([fixture.request]);
    expect(outcome).toEqual(fixture.unverified ? outcome : (fixture.result ?? fixture.error));
  });
});

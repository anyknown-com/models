import type { SynthesizeRequest } from "../../../src/types/synthesize-request";
import type { TranscribeRequest } from "../../../src/types/transcribe-request";
import type { JsonObject, JsonValue } from "../../../src/types/json";
import type { FixtureResponse } from "../fixture";

export type RequestFields = {
  method: string;
  url: string;
  headers: Record<string, string>;
  fields?: JsonValue;
};

export type SpeechFixture<Input> = {
  unverified?: boolean;
  input: Input;
  request: RequestFields;
  response: FixtureResponse;
  result?: JsonValue;
  error?: JsonObject;
};

export type TranscribeFixture = SpeechFixture<Omit<TranscribeRequest, "audio" | "signal">>;

export type SynthesizeFixture = SpeechFixture<Omit<SynthesizeRequest, "signal">>;

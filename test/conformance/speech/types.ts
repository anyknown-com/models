import type { AdapterConfig } from "../../../src/types/adapter-config";
import type { FixtureResponse } from "../../wire/fixture";
import type { RequestFields } from "../../wire/speech/types";
import type { SpeechCase } from "../cases";
import type { Check } from "../types";

export type SpeechFixture = {
  unverified?: true;
  derivedFrom?: string;
  request: RequestFields;
  response: FixtureResponse;
};

export type SpeechAdapterEntry<Request, Result> = {
  endpoint: RegExp;
  create: (config: Required<AdapterConfig>) => (request: Request) => Promise<Result>;
};

export type SpeechKind<Input, Request, Result> = {
  kind: "transcribe" | "synthesize";
  cases: readonly SpeechCase<Input>[];
  adapters: Partial<Record<string, SpeechAdapterEntry<Request, Result>>>;
  requestOf: (input: Input, model: string, provider: string, sample: () => Blob) => Request;
};

export type SpeechRun<Request, Result> = {
  request: Request;
  result?: Result;
  error?: unknown;
};

export type SpeechAsserts<Request, Result> = Partial<
  Record<string, Check<SpeechRun<Request, Result>>>
>;

import { TEXT_CASES } from "../../test/conformance/cases/index.ts";
import { TEXT_ADAPTERS } from "../../test/conformance/constants.ts";
import { SYNTHESIZE, TRANSCRIBE } from "../../test/conformance/speech/constants.ts";
import { recordCase } from "./record-case.mjs";
import { recordSpeechCase } from "./record-speech-case.mjs";

const speechAdapters = (adapters) =>
  Object.fromEntries(
    Object.entries(adapters).map(([name, entry]) => [
      name,
      { create: (_, config) => entry.create(config) },
    ]),
  );

const speechKind = (speech) => ({
  cases: speech.cases,
  adapters: speechAdapters(speech.adapters),
  recordOne: (speechCase, options) => recordSpeechCase(speechCase, speech, options),
});

export const KINDS = {
  text: { cases: TEXT_CASES, adapters: TEXT_ADAPTERS, recordOne: recordCase },
  transcribe: speechKind(TRANSCRIBE),
  synthesize: speechKind(SYNTHESIZE),
};

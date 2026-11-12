import { deepgram } from "../../../src/deepgram";
import { elevenlabs } from "../../../src/elevenlabs";
import { fishAudio } from "../../../src/fish-audio";
import { groq } from "../../../src/groq";
import { openai } from "../../../src/openai";
import { synthesize } from "../../../src/synthesize";
import { transcribe } from "../../../src/transcribe";
import type { SynthesizeRequest, SynthesizeResult } from "../../../src/types/synthesize-request";
import type { TranscribeRequest, TranscribeResult } from "../../../src/types/transcribe-request";
import { SYNTHESIZE_CASES, TRANSCRIBE_CASES } from "../cases";
import type { SynthesizeInput, TranscribeInput } from "../cases";
import { synthesizeRequestOf } from "./synthesize-request-of";
import { transcribeRequestOf } from "./transcribe-request-of";
import type { SpeechKind } from "./types";

const TRANSCRIPTIONS = /\/audio\/transcriptions$/;

export const TRANSCRIBE: SpeechKind<TranscribeInput, TranscribeRequest, TranscribeResult> = {
  kind: "transcribe",
  cases: TRANSCRIBE_CASES,
  requestOf: transcribeRequestOf,
  adapters: {
    openai: {
      endpoint: TRANSCRIPTIONS,
      create: (config) => (request) => transcribe(openai(config), request),
    },
    groq: {
      endpoint: TRANSCRIPTIONS,
      create: (config) => (request) => transcribe(groq(config), request),
    },
    deepgram: {
      endpoint: /\/listen\?[^/]*$/,
      create: (config) => (request) => transcribe(deepgram(config), request),
    },
    elevenlabs: {
      endpoint: /\/speech-to-text$/,
      create: (config) => (request) => transcribe(elevenlabs(config), request),
    },
    "fish-audio": {
      endpoint: /\/v1\/asr$/,
      create: (config) => (request) => transcribe(fishAudio(config), request),
    },
  },
};

export const SYNTHESIZE: SpeechKind<SynthesizeInput, SynthesizeRequest, SynthesizeResult> = {
  kind: "synthesize",
  cases: SYNTHESIZE_CASES,
  requestOf: synthesizeRequestOf,
  adapters: {
    openai: {
      endpoint: /\/audio\/speech$/,
      create: (config) => (request) => synthesize(openai(config), request),
    },
    elevenlabs: {
      endpoint: /\/text-to-speech\/[^/]*\?[^/]*$/,
      create: (config) => (request) => synthesize(elevenlabs(config), request),
    },
    "fish-audio": {
      endpoint: /\/v1\/tts$/,
      create: (config) => (request) => synthesize(fishAudio(config), request),
    },
  },
};

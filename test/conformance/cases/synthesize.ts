import type { SpeechCase, SynthesizeInput } from "./types";

const hello = {
  text: "Hello from Anyknown.",
  voiceBy: { openai: "alloy", elevenlabs: "21m00Tcm4TlvDq8ikWAM" },
};

const named = {
  text: hello.text,
  voiceBy: {
    openai: "coral",
    elevenlabs: "JBFqnCBsd6RMkjVDRZzb",
    "fish-audio": "9a9cf47702da476aa4629e2506d4a857",
  },
};

export const SYNTHESIZE_CASES = [
  { id: "synthesize", source: "recorded", request: hello },
  { id: "synthesize-voice", source: "recorded", request: named },
  { id: "synthesize-error-auth", source: "recorded", request: hello, record: "wrong-key" },
  { id: "synthesize-error-bad-request", source: "recorded", request: { ...hello, text: "" } },
  {
    id: "synthesize-error-rate-limit",
    source: "derived",
    from: "synthesize-error-auth",
    status: 429,
  },
  {
    id: "synthesize-error-server",
    source: "derived",
    from: "synthesize-error-auth",
    status: 500,
  },
  { id: "synthesize-error-network", source: "synthetic", request: hello, fetch: "throws" },
  { id: "synthesize-abort", source: "synthetic", request: hello, fetch: "aborts" },
] as const satisfies readonly SpeechCase<SynthesizeInput>[];

export type SynthesizeCaseId = (typeof SYNTHESIZE_CASES)[number]["id"];

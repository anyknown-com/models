import type { SynthesizeRequest, SynthesizeResult } from "../../../src/types/synthesize-request";
import type { TranscribeRequest, TranscribeResult } from "../../../src/types/transcribe-request";
import type { SpeechAsserts } from "../speech/types";
import { speechErrorAsserts } from "./speech-error-asserts";
import { synthesized } from "./synthesized";
import { transcribed } from "./transcribed";

export const TRANSCRIBE_ASSERTS: SpeechAsserts<TranscribeRequest, TranscribeResult> = {
  transcribe: transcribed,
  "transcribe-terms": transcribed,
  "transcribe-languages": transcribed,
  ...speechErrorAsserts("transcribe"),
};

export const SYNTHESIZE_ASSERTS: SpeechAsserts<SynthesizeRequest, SynthesizeResult> = {
  synthesize: synthesized,
  "synthesize-voice": synthesized,
  ...speechErrorAsserts("synthesize"),
};

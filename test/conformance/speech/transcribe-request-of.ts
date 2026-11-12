import type { TranscribeRequest } from "../../../src/types/transcribe-request";
import type { TranscribeInput } from "../cases";
import { speechAudio } from "./speech-audio";

export const transcribeRequestOf = (
  { audio, ...input }: TranscribeInput,
  model: string,
  _provider: string,
  sample: () => Blob,
): TranscribeRequest => ({ ...input, model, audio: speechAudio(audio, sample) });

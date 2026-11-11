import type { TranscribeRequest, TranscribeResult } from "./transcribe-request";

export interface TranscribeAdapter {
  readonly provider: string;
  transcribe(request: TranscribeRequest): Promise<TranscribeResult>;
}

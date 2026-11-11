import type { SynthesizeRequest, SynthesizeResult } from "./synthesize-request";

export interface SynthesizeAdapter {
  readonly provider: string;
  synthesize(request: SynthesizeRequest): Promise<SynthesizeResult>;
}

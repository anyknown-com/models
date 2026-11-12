import type { SynthesizeRequest } from "../../../src/types/synthesize-request";
import type { SynthesizeInput } from "../cases";

export function synthesizeRequestOf(
  { text, voiceBy }: SynthesizeInput,
  model: string,
  provider: string,
): SynthesizeRequest {
  const voice = voiceBy?.[provider];

  return { model, text, ...(voice === undefined ? {} : { voice }) };
}

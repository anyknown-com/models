import type { StreamEvent } from "./stream-event";
import type { TextCapabilities } from "./text-capabilities";
import type { TextRequest } from "./text-request";

export interface TextAdapter {
  readonly provider: string;
  capabilities(model: string): TextCapabilities;
  stream(request: TextRequest): AsyncIterable<StreamEvent>;
}

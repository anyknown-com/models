import type { ModelMessage } from "./model-message";
import type { TextPart } from "./parts";
import type { ProviderOptions } from "./provider-options";
import type { ToolDeclaration } from "./tool";

export type TextRequest = {
  model: string;
  system?: TextPart[];
  messages: ModelMessage[];
  tools?: ToolDeclaration[];
  maxOutputTokens?: number;
  providerOptions?: ProviderOptions;
  signal?: AbortSignal;
};

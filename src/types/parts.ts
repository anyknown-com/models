import type { JsonValue } from "./json";
import type { ProviderOptions } from "./provider-options";

export type TextPart = { type: "text"; text: string; providerOptions?: ProviderOptions };

export type ImagePart = {
  type: "image";
  image: Uint8Array | URL;
  mediaType?: string;
  providerOptions?: ProviderOptions;
};

export type FilePart = {
  type: "file";
  data: Uint8Array | URL;
  mediaType: string;
  filename?: string;
  providerOptions?: ProviderOptions;
};

export type ReasoningPart = { type: "reasoning"; text: string; providerOptions?: ProviderOptions };

export type ToolCallPart = {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  input: JsonValue;
  providerOptions?: ProviderOptions;
  providerExecuted?: boolean;
};

export type ToolResultOutput =
  | { type: "text"; value: string; providerOptions?: ProviderOptions }
  | { type: "json"; value: JsonValue; providerOptions?: ProviderOptions }
  | { type: "error-text"; value: string; providerOptions?: ProviderOptions }
  | { type: "error-json"; value: JsonValue; providerOptions?: ProviderOptions }
  | {
      type: "content";
      value: (TextPart | ImagePart | FilePart)[];
      providerOptions?: ProviderOptions;
    };

export type ToolResultPart = {
  type: "tool-result";
  toolCallId: string;
  toolName: string;
  output: ToolResultOutput;
  providerOptions?: ProviderOptions;
};

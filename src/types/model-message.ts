import type {
  FilePart,
  ImagePart,
  ReasoningPart,
  TextPart,
  ToolCallPart,
  ToolResultPart,
} from "./parts";
import type { ProviderOptions } from "./provider-options";

export type UserModelMessage = {
  role: "user";
  content: string | (TextPart | ImagePart | FilePart)[];
  providerOptions?: ProviderOptions;
};

export type AssistantModelMessage = {
  role: "assistant";
  content: string | (TextPart | FilePart | ReasoningPart | ToolCallPart | ToolResultPart)[];
  providerOptions?: ProviderOptions;
};

export type ToolModelMessage = {
  role: "tool";
  content: ToolResultPart[];
  providerOptions?: ProviderOptions;
};

export type ModelMessage = UserModelMessage | AssistantModelMessage | ToolModelMessage;

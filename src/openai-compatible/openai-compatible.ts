import type { TextAdapter } from "../types/text-adapter";
import { streamChat } from "./stream-chat";
import type { OpenaiCompatibleConfig } from "./types";

export function openaiCompatible(config: OpenaiCompatibleConfig): TextAdapter {
  return {
    provider: config.name,
    capabilities: () => ({ thinking: "none", effortLevels: [] }),
    stream: (request) => streamChat(config, request),
  };
}

import type { TextAdapter } from "../types/text-adapter";
import type { OpenaiCompatibleConfig } from "./types";
import { unsupported } from "./unsupported";

export function openaiCompatible(config: OpenaiCompatibleConfig): TextAdapter {
  return {
    provider: config.name,
    capabilities: () => ({ thinking: "none", effortLevels: [] }),
    stream: () => {
      throw unsupported(config.name, "openai-compatible streaming is not supported");
    },
  };
}

import { MISTRAL_TOOL_USE_ID_LENGTH } from "./constants";

export const toolUseIdOf = (callId: string, model: string): string =>
  model.includes("mistral.")
    ? callId.replace(/[^a-zA-Z0-9]/g, "").slice(0, MISTRAL_TOOL_USE_ID_LENGTH)
    : callId;

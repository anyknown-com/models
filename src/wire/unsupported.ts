import { ModelError } from "../model-error";

export const unsupported = (provider: string, message: string): ModelError =>
  new ModelError({ kind: "unsupported", provider, retryable: false, message });

import { ModelError } from "../model-error";
import { PROVIDER } from "./constants";

export const unsupported = (message: string): ModelError =>
  new ModelError({ kind: "unsupported", provider: PROVIDER, retryable: false, message });

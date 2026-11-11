import { ModelError } from "../model-error";
import { fieldOf } from "../speech/field-of";
import type { VideoJob } from "../types/video-job";
import { PROVIDER } from "./constants";

export function videoJobOf(body: unknown): VideoJob {
  const id = fieldOf(body, "id");

  if (typeof id === "string" && id !== "") return { provider: PROVIDER, id };

  throw new ModelError({
    kind: "server",
    provider: PROVIDER,
    retryable: false,
    message: "google returned no interaction id",
    body: JSON.stringify(body),
  });
}

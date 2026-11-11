import type { ModelError } from "../model-error";

export type VideoJobStatus =
  | { status: "queued" | "running" | "succeeded"; raw?: unknown }
  | { status: "failed"; error: ModelError; raw?: unknown };

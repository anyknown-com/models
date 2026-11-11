import type { EmbedRequest } from "../types/embed-request";
import type { EmbedResult } from "../types/embed-result";
import { batchesOf } from "./batches-of";
import { EMBED_BATCH_MAX } from "./constants";
import { runWithin } from "./run-within";
import type { WorkersAiBinding } from "./types";

const dataOf = (output: unknown): number[][] =>
  typeof output === "object" && output !== null && "data" in output && Array.isArray(output.data)
    ? output.data
    : [];

export async function embedBatches(
  binding: WorkersAiBinding,
  { model, values, signal }: EmbedRequest,
): Promise<EmbedResult> {
  const outputs = await Promise.all(
    batchesOf(values, EMBED_BATCH_MAX).map((text) => runWithin(binding, model, { text }, signal)),
  );

  return { embeddings: outputs.flatMap(dataOf) };
}

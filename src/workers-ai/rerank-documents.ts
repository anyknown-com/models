import type { JsonObject } from "../types/json";
import type { RerankRequest } from "../types/rerank-request";
import type { RerankResult } from "../types/rerank-result";
import { runWithin } from "./run-within";
import type { WorkersAiBinding } from "./types";

type Ranked = RerankResult["ranking"][number];

const entriesOf = (output: unknown): unknown[] =>
  typeof output === "object" &&
  output !== null &&
  "response" in output &&
  Array.isArray(output.response)
    ? output.response
    : [];

const rankedOf = (entry: unknown): Ranked[] => {
  if (typeof entry !== "object" || entry === null) return [];

  const id = "id" in entry ? entry.id : undefined;
  const score = "score" in entry ? entry.score : undefined;

  if (typeof id !== "number" || !Number.isInteger(id)) return [];

  return [{ index: id, score: typeof score === "number" ? score : 0 }];
};

export async function rerankDocuments(
  binding: WorkersAiBinding,
  { model, query, documents, topK, signal }: RerankRequest,
): Promise<RerankResult> {
  const contexts = documents.map((text) => ({ text }));

  const input: JsonObject =
    topK === undefined ? { query, contexts } : { query, contexts, top_k: topK };

  const output = await runWithin(binding, model, input, signal);

  return { ranking: entriesOf(output).flatMap(rankedOf) };
}

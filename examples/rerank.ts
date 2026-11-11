import { ModelError, rerank } from "@anyknown/models";
import { type WorkersAiBinding, workersAi } from "@anyknown/models/workers-ai";

export async function rankDocuments(
  binding: WorkersAiBinding,
  query: string,
  documents: string[],
): Promise<{ document: string; score: number }[] | null> {
  try {
    const { ranking } = await rerank(workersAi({ binding }), {
      model: "@cf/baai/bge-reranker-base",
      query,
      documents,
    });

    return ranking.map(({ index, score }) => ({ document: documents[index], score }));
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}

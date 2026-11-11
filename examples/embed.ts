import { ModelError, embed } from "@anyknown/models";
import { type WorkersAiBinding, workersAi } from "@anyknown/models/workers-ai";

export async function embedNotes(
  binding: WorkersAiBinding,
  notes: string[],
): Promise<number[][] | null> {
  try {
    const { embeddings } = await embed(workersAi({ binding }), {
      model: "@cf/qwen/qwen3-embedding-0.6b",
      values: notes,
    });

    return embeddings;
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}

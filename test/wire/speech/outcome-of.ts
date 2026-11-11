import { ModelError } from "../../../src/model-error";
import type { JsonValue } from "../../../src/types/json";
import type { SpeechUsage } from "../../../src/types/speech-usage";

const errorOf = (error: ModelError): JsonValue =>
  JSON.parse(
    JSON.stringify({
      kind: error.kind,
      status: error.status,
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    }),
  );

export async function outcomeOf(
  run: Promise<{ text?: string; usage: SpeechUsage }>,
): Promise<JsonValue> {
  try {
    const { text, usage } = await run;

    return text === undefined ? { usage } : { text, usage };
  } catch (error) {
    if (error instanceof ModelError) return errorOf(error);

    throw error;
  }
}

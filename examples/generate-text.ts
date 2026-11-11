import { ModelError, generateText } from "@anyknown/models";
import { openai } from "@anyknown/models/openai";

export async function answer(key: string, question: string): Promise<string | null> {
  try {
    const { text } = await generateText(openai({ key }), {
      model: "gpt-5-mini",
      messages: [{ role: "user", content: question }],
    });

    return text;
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}

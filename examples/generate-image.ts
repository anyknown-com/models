import { ModelError, generateImage } from "@anyknown/models";
import { openai } from "@anyknown/models/openai";

export async function draw(key: string, prompt: string): Promise<Uint8Array | URL | null> {
  try {
    const { image } = await generateImage(openai({ key }), {
      model: "gpt-image-2.5-sunburst",
      prompt,
    });

    return image;
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}

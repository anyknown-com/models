import { ModelError, transcribe } from "@anyknown/models";
import { groq } from "@anyknown/models/groq";

export async function transcribeClip(key: string, audio: Blob): Promise<string | null> {
  try {
    const { text } = await transcribe(groq({ key }), {
      model: "whisper-large-v3-turbo",
      audio,
      filename: "clip.webm",
      language: "en",
    });

    return text;
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}

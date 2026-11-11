import { ModelError, type VideoJob, submitVideo } from "@anyknown/models";
import { google } from "@anyknown/models/google";

export async function startFilm(key: string, prompt: string): Promise<VideoJob | null> {
  try {
    return await submitVideo(google({ key }), {
      model: "gemini-omni-1.2-flash",
      prompt,
    });
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}

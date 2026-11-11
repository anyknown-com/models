import { ModelError, type VideoJob, readVideoResult } from "@anyknown/models";
import { google } from "@anyknown/models/google";

export async function downloadFilm(key: string, job: VideoJob): Promise<Uint8Array | null> {
  try {
    const { video } = await readVideoResult(google({ key }), job);

    if (video instanceof Uint8Array) return video;

    const response = video instanceof URL ? await fetch(video) : video;

    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}

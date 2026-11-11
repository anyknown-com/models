import { ModelError, type VideoJob, readVideoStatus } from "@anyknown/models";
import { google } from "@anyknown/models/google";

export async function filmReady(key: string, job: VideoJob): Promise<boolean> {
  try {
    const status = await readVideoStatus(google({ key }), job);

    if (status.status === "failed") throw status.error;

    return status.status === "succeeded";
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return false;

    throw error;
  }
}

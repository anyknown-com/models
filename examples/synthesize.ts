import { ModelError, synthesize } from "@anyknown/models";
import { elevenlabs } from "@anyknown/models/elevenlabs";

export async function speak(key: string, voice: string, text: string): Promise<Blob | null> {
  try {
    const { audio } = await synthesize(elevenlabs({ key }), {
      model: "eleven_flash_v2_5",
      text,
      voice,
    });

    return await audio.blob();
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}

import { streamText } from "@anyknown/models";
import { anthropic } from "@anyknown/models/anthropic";

export async function streamAnswer(
  key: string,
  question: string,
  onText: (delta: string) => void,
): Promise<number | null> {
  const events = streamText(anthropic({ key }), {
    model: "claude-sonnet-4-5",
    messages: [{ role: "user", content: question }],
    maxOutputTokens: 1024,
  });

  for await (const event of events) {
    if (event.type === "text") onText(event.delta);
    if (event.type !== "finish") continue;
    if (event.error?.retryable) return null;
    if (event.error) throw event.error;

    return event.usage.output;
  }

  return null;
}

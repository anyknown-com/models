import { contentDeltasOf } from "./content-deltas-of";
import type { ChatDelta, ContentDelta } from "./types";

export function deltasOf(delta: ChatDelta | null | undefined): ContentDelta[] {
  if (!delta) return [];

  const reasoning = delta.reasoning_content ?? delta.reasoning;

  const reasoned: ContentDelta[] =
    typeof reasoning === "string" && reasoning ? [{ type: "reasoning", text: reasoning }] : [];

  return [...reasoned, ...contentDeltasOf(delta.content)];
}

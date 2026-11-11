import type { ContentDelta } from "./types";

type ContentPart = { type?: unknown; text?: unknown; thinking?: unknown };

const textOf = (part: unknown): string => {
  const { type, text } = (part ?? {}) as ContentPart;

  return type === "text" && typeof text === "string" ? text : "";
};

const deltaOf = (part: ContentPart): ContentDelta | undefined => {
  if (part.type === "text") return { type: "text", text: textOf(part) };
  if (part.type !== "thinking" || !Array.isArray(part.thinking)) return undefined;

  return { type: "reasoning", text: part.thinking.map(textOf).join("") };
};

export function contentDeltasOf(content: unknown): ContentDelta[] {
  if (typeof content === "string") return content ? [{ type: "text", text: content }] : [];
  if (!Array.isArray(content)) return [];

  return content
    .map((part: ContentPart) => deltaOf(part ?? {}))
    .filter((delta): delta is ContentDelta => delta !== undefined && delta.text !== "");
}

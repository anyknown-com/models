import type { GoogleContent } from "./types";

export function withSystemPrefix(
  contents: GoogleContent[],
  system: { text: string }[],
): GoogleContent[] {
  const [first, ...rest] = contents;

  if (system.length === 0 || first?.role !== "user") return contents;

  const text = `${system.map((part) => part.text).join("\n\n")}\n\n`;

  return [{ ...first, parts: [{ text }, ...first.parts] }, ...rest];
}

import type { ToolResultOutput } from "../types/parts";
import { toolContentPartOf } from "./tool-content-part-of";

export function toolContentOf(provider: string, output: ToolResultOutput): string {
  if (output.type === "text" || output.type === "error-text") return output.value;
  if (output.type !== "content") return JSON.stringify(output.value);

  return JSON.stringify(output.value.map((part) => toolContentPartOf(provider, part)));
}

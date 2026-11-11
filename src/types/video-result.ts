import type { VisualUsage } from "./visual-usage";

export type VideoResult = {
  video: Uint8Array | Response | URL;
  mediaType?: string;
  usage: VisualUsage;
  raw?: unknown;
};

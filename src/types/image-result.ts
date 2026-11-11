import type { VisualUsage } from "./visual-usage";

export type ImageResult = {
  image: Uint8Array | URL;
  mediaType?: string;
  usage: VisualUsage;
  raw?: unknown;
};

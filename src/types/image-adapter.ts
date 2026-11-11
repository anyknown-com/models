import type { ImageRequest } from "./image-request";
import type { ImageResult } from "./image-result";

export interface ImageAdapter {
  readonly provider: string;
  generateImage(request: ImageRequest): Promise<ImageResult>;
}

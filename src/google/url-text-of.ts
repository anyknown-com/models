import type { ToolMedia } from "./types";

export const urlTextOf = (url: URL, { mediaType, providerOptions }: ToolMedia): string =>
  JSON.stringify({
    type: "file",
    data: { type: "url", url: url.href },
    mediaType,
    providerOptions,
  });

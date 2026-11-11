import { bytesOfBase64 } from "./base64";

type PartBytes = { bytes: Uint8Array; mediaType: string | undefined };

const BASE64_SUFFIX = ";base64";

function dataUrlBytes(url: URL, mediaType: string | undefined): PartBytes {
  const content = url.href.slice(url.protocol.length);
  const comma = content.indexOf(",");
  const header = content.slice(0, comma);
  const payload = content.slice(comma + 1);
  const isBase64 = header.endsWith(BASE64_SUFFIX);
  const declared = header.slice(0, isBase64 ? -BASE64_SUFFIX.length : undefined).split(";")[0];

  const bytes = isBase64
    ? bytesOfBase64(payload)
    : new TextEncoder().encode(decodeURIComponent(payload));

  return { bytes, mediaType: mediaType ?? (declared || undefined) };
}

export function bytesOf(data: Uint8Array | URL, mediaType?: string): PartBytes | { url: URL } {
  if (data instanceof Uint8Array) return { bytes: data, mediaType };
  if (data.protocol === "data:") return dataUrlBytes(data, mediaType);

  return { url: data };
}

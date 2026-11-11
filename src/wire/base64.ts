const CHUNK = 0x8000;

export function base64Of(bytes: Uint8Array): string {
  const chunks: string[] = [];

  for (let start = 0; start < bytes.length; start += CHUNK) {
    chunks.push(String.fromCharCode(...bytes.subarray(start, start + CHUNK)));
  }

  return btoa(chunks.join(""));
}

export const bytesOfBase64 = (base64: string): Uint8Array =>
  Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

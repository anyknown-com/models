import { IMAGE_SIGNATURES } from "./image-signatures";

export function imageMediaTypeOf(bytes: Uint8Array): string | undefined {
  const match = IMAGE_SIGNATURES.find(
    ([, prefix]) =>
      bytes.length >= prefix.length &&
      prefix.every((byte, i) => byte === null || bytes[i] === byte),
  );

  return match?.[0];
}

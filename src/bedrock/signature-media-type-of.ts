import type { Signatures } from "./types";

export const signatureMediaTypeOf = (bytes: Uint8Array, signatures: Signatures) =>
  signatures.find(
    ([, prefix]) =>
      bytes.length >= prefix.length &&
      prefix.every((byte, i) => byte === null || bytes[i] === byte),
  )?.[0];

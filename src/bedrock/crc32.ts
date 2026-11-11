import { CRC32_POLYNOMIAL } from "./constants";

const shifted = (crc: number) => (crc & 1 ? (crc >>> 1) ^ CRC32_POLYNOMIAL : crc >>> 1);

const TABLE = Uint32Array.from({ length: 256 }, (_, byte) => {
  let crc = byte;

  for (let bit = 0; bit < 8; bit++) crc = shifted(crc);

  return crc;
});

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of bytes) crc = TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);

  return (crc ^ 0xffffffff) >>> 0;
}

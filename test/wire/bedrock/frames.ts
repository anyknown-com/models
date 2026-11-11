import { crc32 } from "../../../src/bedrock/crc32";
import type { JsonValue } from "../../../src/types/json";

const encoder = new TextEncoder();

export const u16 = (value: number) => [value >>> 8, value & 0xff];

export const u32 = (value: number) => [
  value >>> 24,
  (value >>> 16) & 0xff,
  (value >>> 8) & 0xff,
  value & 0xff,
];

export const header = (name: string, type: number, value: number[]) => [
  name.length,
  ...encoder.encode(name),
  type,
  ...value,
];

export const stringHeader = (name: string, value: string) => {
  const bytes = [...encoder.encode(value)];

  return header(name, 7, [...u16(bytes.length), ...bytes]);
};

export const frame = (headers: number[], payload: string) => {
  const body = [...encoder.encode(payload)];
  const prelude = [...u32(16 + headers.length + body.length), ...u32(headers.length)];
  const message = [...prelude, ...u32(crc32(Uint8Array.from(prelude))), ...headers, ...body];

  return [...message, ...u32(crc32(Uint8Array.from(message)))];
};

export const eventFrame = (type: string, payload: JsonValue | string) =>
  frame(
    [
      ...stringHeader(":event-type", type),
      ...stringHeader(":content-type", "application/json"),
      ...stringHeader(":message-type", "event"),
    ],
    typeof payload === "string" ? payload : JSON.stringify(payload),
  );

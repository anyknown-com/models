import { STRING_TYPE } from "./constants";
import { valueRangeOf } from "./value-range-of";

export function headersOf(bytes: Uint8Array): Record<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const headers: Record<string, string> = {};
  let at = 0;

  while (at < bytes.length) {
    const nameEnd = at + 1 + view.getUint8(at);
    const type = view.getUint8(nameEnd);
    const [start, end] = valueRangeOf(view, type, nameEnd + 1);

    if (type === STRING_TYPE) {
      headers[decoder.decode(bytes.subarray(at + 1, nameEnd))] = decoder.decode(
        bytes.subarray(start, end),
      );
    }

    at = end;
  }

  return headers;
}

import { fieldOf } from "./field-of";

export function lastEnd(items: readonly unknown[]): number | null {
  let last: number | null = null;

  for (const item of items) {
    const end = fieldOf(item, "end");

    if (typeof end === "number" && (last === null || end > last)) last = end;
  }

  return last;
}

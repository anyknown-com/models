import { isPlainObject, mapValues } from "es-toolkit";

type Repeat = { $repeat: string; times: number };

const isRepeat = (value: Record<string, unknown>): value is Repeat =>
  typeof value["$repeat"] === "string" &&
  typeof value["times"] === "number" &&
  Object.keys(value).length === 2;

export function expandRepeats<T>(value: T): T {
  if (Array.isArray(value)) return value.map(expandRepeats) as T;
  if (!isPlainObject(value)) return value;
  if (isRepeat(value)) return value.$repeat.repeat(value.times) as T;

  return mapValues(value, expandRepeats) as T;
}

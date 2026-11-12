import { isEqual } from "es-toolkit";
import type { RequestFields } from "../../wire/speech/types";

const diffOf = (field: string, expected: unknown, actual: unknown) =>
  isEqual(expected, actual)
    ? []
    : [`${field}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`];

export const requestDiffs = (expected: RequestFields, actual: RequestFields): string[] => [
  ...diffOf("method", expected.method, actual.method),
  ...diffOf("url", expected.url, actual.url),
  ...Object.entries(expected.headers).flatMap(([name, value]) =>
    diffOf(`header ${name}`, value, actual.headers[name]),
  ),
  ...diffOf("fields", expected.fields, actual.fields),
];

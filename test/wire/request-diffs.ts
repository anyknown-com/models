import { isEqual } from "es-toolkit";
import type { JsonValue } from "../../src/types/json";
import type { FixtureRequest } from "./fixture";

const diffOf = (field: string, expected: unknown, actual: unknown) =>
  isEqual(expected, actual)
    ? []
    : [`${field}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`];

export const requestDiffs = (
  expected: FixtureRequest,
  actual: Request,
  body: JsonValue | undefined,
): string[] => [
  ...diffOf("method", expected.method, actual.method),
  ...diffOf("url", expected.url, actual.url),
  ...Object.entries(expected.headers).flatMap(([name, value]) =>
    diffOf(`header ${name}`, value, actual.headers.get(name)),
  ),
  ...diffOf("body", expected.body, body),
];

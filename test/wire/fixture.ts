import type { JsonValue } from "../../src/types/json";

export interface FixtureRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: JsonValue;
}

export type FixtureResponse = { status: number; headers: Record<string, string> } & (
  | { body: JsonValue }
  | { chunks: string[]; encoding?: "base64" }
);

export interface Fixture {
  unverified?: true;
  request: FixtureRequest;
  response: FixtureResponse;
}

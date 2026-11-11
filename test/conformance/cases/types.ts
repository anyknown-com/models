import type { TextRequest } from "../../../src/types/text-request";

export type TextCase =
  | {
      id: string;
      source: "recorded";
      request: TextRequest;
      record?: "twice" | "wrong-key" | "request-model";
    }
  | { id: string; source: "recorded"; fixtureOf: string }
  | { id: string; source: "derived"; from: string; status: number }
  | {
      id: string;
      source: "synthetic";
      request: TextRequest;
      fetch: "throws" | "aborts" | "unused";
    };

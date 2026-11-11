import {
  badRequest,
  errorNotFound,
  errorOverflow,
  errorUnsupported,
  file,
  image,
  reasoning,
  text,
  textCache,
  toolCall,
  tools,
} from "../../wire/cases";
import type { TextCase } from "./types";

export const TEXT_CASES = [
  { id: "text", source: "recorded", request: text },
  { id: "stream-order", source: "recorded", fixtureOf: "text" },
  { id: "tool-call", source: "recorded", request: toolCall },
  { id: "tool-result", source: "recorded", request: tools },
  { id: "image", source: "recorded", request: image },
  { id: "file", source: "recorded", request: file },
  { id: "reasoning", source: "recorded", request: reasoning },
  { id: "usage", source: "recorded", fixtureOf: "text" },
  { id: "usage-cache", source: "recorded", request: textCache, record: "twice" },
  { id: "error-auth", source: "recorded", request: text, record: "wrong-key" },
  { id: "error-bad-request", source: "recorded", request: badRequest },
  { id: "error-not-found", source: "recorded", request: errorNotFound, record: "request-model" },
  { id: "error-overflow", source: "recorded", request: errorOverflow },
  { id: "error-rate-limit", source: "derived", from: "error-bad-request", status: 429 },
  { id: "error-server", source: "derived", from: "error-bad-request", status: 500 },
  { id: "error-network", source: "synthetic", request: text, fetch: "throws" },
  { id: "error-unsupported", source: "synthetic", request: errorUnsupported, fetch: "unused" },
  { id: "abort", source: "synthetic", request: text, fetch: "aborts" },
] as const satisfies readonly TextCase[];

export type TextCaseId = (typeof TEXT_CASES)[number]["id"];

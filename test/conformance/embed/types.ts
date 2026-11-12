import type { JsonObject } from "../../../src/types/json";
import type { WorkersAiBinding } from "../../../src/workers-ai";
import type { EmbedCase } from "../cases";
import type { Check } from "../types";

export type BindingCall = { model: string; input: JsonObject } & (
  | { output: unknown }
  | { error: string }
);

export type EmbedFixture = { unverified?: true; calls: BindingCall[] };

export type EmbedKind<Input, Request, Result> = {
  kind: "embed" | "rerank";
  cases: readonly EmbedCase<Input>[];
  adapters: Partial<
    Record<string, (binding: WorkersAiBinding) => (request: Request) => Promise<Result>>
  >;
  requestOf: (input: Input, model: string) => Request;
};

export type EmbedRun<Request, Result> = {
  request: Request;
  result?: Result;
  error?: unknown;
};

export type EmbedAsserts<Request, Result> = Partial<
  Record<string, Check<EmbedRun<Request, Result>>>
>;

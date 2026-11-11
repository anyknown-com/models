import type { AdapterConfig } from "../../src/types/adapter-config";
import type { StreamEvent } from "../../src/types/stream-event";
import type { TextAdapter } from "../../src/types/text-adapter";
import type { TextRequest } from "../../src/types/text-request";
import type { Fixture } from "../wire/fixture";
import type { TextCaseId } from "./cases";

export type Manifest = {
  provider: string;
  adapters: Record<string, string>;
  models: Record<string, string>;
  unsupported: Record<string, string>;
  unverified?: true;
};

export type ConformanceFixture = Fixture & { derivedFrom?: string };

export type ProviderDir = { manifest: Manifest; fixtures: Map<string, ConformanceFixture> };

export type TextAdapterEntry = {
  endpoint: RegExp;
  create: (provider: string, config: Required<AdapterConfig>) => TextAdapter;
};

export type CaseRun = { events: StreamEvent[]; request: TextRequest; fixture?: ConformanceFixture };

export type CaseAssert = (run: CaseRun) => void;

export type TextAsserts = Partial<Record<TextCaseId, CaseAssert>>;

export type Verdict = { id: string; result: "pass" | "fail" | "declared"; reason?: string };

export type ProviderRun = { provider: string; unverified: boolean; verdicts: Verdict[] };

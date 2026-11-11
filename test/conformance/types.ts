import type { Fixture } from "../wire/fixture";

export type Manifest = {
  provider: string;
  adapters: Record<string, string>;
  models: Record<string, string>;
  unsupported: Record<string, string>;
  unverified?: true;
};

export type ConformanceFixture = Fixture & { derivedFrom?: string };

export type ProviderDir = { manifest: Manifest; fixtures: Map<string, ConformanceFixture> };

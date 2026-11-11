import type { ModelError } from "../model-error";

export type ProviderError = { kind?: ModelError["kind"]; code?: string; message: string };

export type ErrorOf = (body: string, status: number, headers: Headers) => ProviderError;

export type ReadField = { path: string[]; type: "string" | "number" | "object"; required?: true };

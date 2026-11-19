type ModelErrorInit = {
  kind: ModelError["kind"];
  provider: string;
  retryable: boolean;
  status?: number;
  code?: string;
  message: string;
  body?: string;
  resetAt?: string | null;
  cause?: unknown;
};

export class ModelError extends Error {
  kind:
    | "auth"
    | "rate-limit"
    | "overflow"
    | "bad-request"
    | "not-found"
    | "server"
    | "network"
    | "abort"
    | "unsupported";
  provider: string;
  retryable: boolean;
  status?: number;
  code?: string;
  body?: string;
  resetAt: string | null;

  constructor(init: ModelErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = "ModelError";
    this.kind = init.kind;
    this.provider = init.provider;
    this.retryable = init.retryable;
    this.status = init.status;
    this.code = init.code;
    this.body = init.body;
    this.resetAt = init.resetAt ?? null;
  }
}

import { expect } from "vitest";
import { NETWORK_FAILURE } from "../constants";
import { speechErrorLike } from "./speech-error-like";

const SAID = expect.stringMatching(/\S/);

export const speechErrorAsserts = (kind: "transcribe" | "synthesize") => ({
  [`${kind}-error-auth`]: speechErrorLike({
    kind: "auth",
    status: expect.any(Number),
    body: SAID,
    retryable: false,
  }),
  [`${kind}-error-bad-request`]: speechErrorLike({ kind: "bad-request", message: SAID }),
  [`${kind}-error-rate-limit`]: speechErrorLike({ kind: "rate-limit", retryable: true }),
  [`${kind}-error-server`]: speechErrorLike({ kind: "server", retryable: true }),
  [`${kind}-error-network`]: speechErrorLike({
    kind: "network",
    status: undefined,
    cause: NETWORK_FAILURE,
  }),
  [`${kind}-abort`]: speechErrorLike({ kind: "abort", status: undefined, retryable: false }),
});

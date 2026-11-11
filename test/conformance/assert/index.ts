import { expect } from "vitest";
import type { TextAsserts } from "../types";
import { abort } from "./abort";
import { acceptedWithText } from "./accepted-with-text";
import { errorNetwork } from "./error-network";
import { modelErrorLike } from "./model-error-like";
import { reasoning } from "./reasoning";
import { streamOrder } from "./stream-order";
import { text } from "./text";
import { toolCall } from "./tool-call";
import { usage } from "./usage";
import { usageCache } from "./usage-cache";

const SAID = expect.stringMatching(/\S/);

export const TEXT_ASSERTS: TextAsserts = {
  text,
  "stream-order": streamOrder,
  "tool-call": toolCall,
  "tool-result": acceptedWithText,
  image: acceptedWithText,
  file: acceptedWithText,
  reasoning,
  usage,
  "usage-cache": usageCache,
  "error-auth": modelErrorLike({
    kind: "auth",
    status: expect.any(Number),
    body: SAID,
    retryable: false,
  }),
  "error-bad-request": modelErrorLike({ kind: "bad-request", message: SAID }),
  "error-not-found": modelErrorLike({ kind: "not-found" }),
  "error-overflow": modelErrorLike({ kind: "overflow" }),
  "error-rate-limit": modelErrorLike({ kind: "rate-limit", retryable: true }),
  "error-server": modelErrorLike({ kind: "server", retryable: true }),
  "error-network": errorNetwork,
  "error-unsupported": modelErrorLike({ kind: "unsupported" }),
  abort,
};

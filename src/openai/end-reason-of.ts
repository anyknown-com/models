import type { FinishReason } from "../types/finish-reason";
import { FINISHED } from "./constants";
import { finishReasonOf } from "./finish-reason-of";
import type { ResponsesEvent } from "./types";

export function endReasonOf(
  { type, response }: ResponsesEvent,
  called: boolean,
  current: FinishReason | undefined,
  failed: boolean,
): FinishReason | undefined {
  const incomplete = response?.incomplete_details?.reason;

  if (type === "response.failed") return incomplete ? finishReasonOf(incomplete, called) : "error";
  if (!FINISHED.has(type) || failed) return current;

  return finishReasonOf(incomplete, called);
}

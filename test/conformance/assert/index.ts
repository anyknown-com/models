import type { TextAsserts } from "../types";
import { reasoning } from "./reasoning";
import { streamOrder } from "./stream-order";
import { text } from "./text";
import { usage } from "./usage";
import { usageCache } from "./usage-cache";

export const TEXT_ASSERTS: TextAsserts = {
  text,
  "stream-order": streamOrder,
  usage,
  "usage-cache": usageCache,
  reasoning,
};

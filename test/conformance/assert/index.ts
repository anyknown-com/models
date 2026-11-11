import type { TextAsserts } from "../types";
import { acceptedWithText } from "./accepted-with-text";
import { reasoning } from "./reasoning";
import { streamOrder } from "./stream-order";
import { text } from "./text";
import { toolCall } from "./tool-call";
import { usage } from "./usage";
import { usageCache } from "./usage-cache";

export const TEXT_ASSERTS: TextAsserts = {
  text,
  "stream-order": streamOrder,
  "tool-call": toolCall,
  "tool-result": acceptedWithText,
  image: acceptedWithText,
  file: acceptedWithText,
  usage,
  "usage-cache": usageCache,
  reasoning,
};

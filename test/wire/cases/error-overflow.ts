import type { TextRequest } from "../../../src/types/text-request";

const OVER_TWO_MILLION_TOKENS = " a".repeat(2_100_000);

export const errorOverflow: TextRequest = {
  model: "model",
  messages: [{ role: "user", content: OVER_TWO_MILLION_TOKENS }],
};

import type { TextRequest } from "../../../src/types/text-request";

export const errorNotFound: TextRequest = {
  model: "anyknown-no-such-model",
  messages: [{ role: "user", content: "Hello." }],
};

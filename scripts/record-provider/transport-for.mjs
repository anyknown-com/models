import { WRONG_KEY } from "./constants.mjs";

const wrongKey = { key: WRONG_KEY, fetch: (input, init) => fetch(input, init), viaApiHost: false };

export const transportFor = (recorded, { transport, requestOnly }) =>
  recorded.record === "wrong-key" && !requestOnly ? wrongKey : transport;

import { AUTH_HEADERS } from "./constants.mjs";

export const withoutAuth = (headers, key) =>
  new Headers(
    [...headers].filter(([name, value]) => !AUTH_HEADERS.includes(name) && !value.includes(key)),
  );

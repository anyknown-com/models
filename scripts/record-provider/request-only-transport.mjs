import { REQUEST_ONLY_KEY } from "./constants.mjs";

const unsent = async () =>
  new Response(JSON.stringify({ error: { message: "request-only" } }), {
    status: 500,
    headers: { "content-type": "application/json" },
  });

const accepted = async () =>
  new Response(JSON.stringify({ id: "request-only", status: "request-only" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

export const REQUEST_ONLY_TRANSPORT = { key: REQUEST_ONLY_KEY, fetch: unsent, viaApiHost: false };

export const REQUEST_ONLY_JOB_TRANSPORT = {
  key: REQUEST_ONLY_KEY,
  fetch: accepted,
  viaApiHost: false,
};

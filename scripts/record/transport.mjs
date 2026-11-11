import { parseArgs } from "node:util";
import { VIA_KEY } from "../record-text/constants.mjs";
import { withoutAuth } from "../record-text/without-auth.mjs";
import { recordToken, viaFetch } from "../via.mjs";

const viaWithoutAuth = (via) => (input, init) => {
  const request = new Request(input, init);

  return via(new Request(request, { headers: withoutAuth(request.headers, VIA_KEY) }));
};

export async function transportOf({ provider, base, keyEnv }) {
  const { values } = parseArgs({ options: { via: { type: "string" } }, strict: false });

  if (values.via) {
    const via = viaFetch({ origin: values.via, provider, base, token: await recordToken() });

    return { key: VIA_KEY, fetch: viaWithoutAuth(via) };
  }

  const key = process.env[keyEnv];

  if (!key) throw new Error(`${keyEnv} is not set`);

  return { key, fetch: (input, init) => fetch(input, init) };
}

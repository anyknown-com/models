import { recordToken, viaFetch } from "../via.mjs";
import { VIA_KEY } from "./constants.mjs";

const directFetch = (input, init) => fetch(input, init);

export async function transportOf({ via, provider, baseUrl, keyEnv }) {
  if (via) {
    if (!baseUrl) throw new Error("--via 要帶 --base-url");
    if (!provider) throw new Error("--via 要帶 --provider");

    const token = await recordToken();

    return {
      key: VIA_KEY,
      fetch: viaFetch({ origin: via, provider, base: baseUrl, token }),
      viaApiHost: true,
    };
  }

  if (!keyEnv) throw new Error("要帶 --key-env 或 --via");

  const key = process.env[keyEnv];

  if (!key) throw new Error(`沒有 env ${keyEnv}`);

  return { key, fetch: directFetch, viaApiHost: false };
}

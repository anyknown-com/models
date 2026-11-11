import { NETWORK_FAILURE } from "./constants";

export const throwingFetch: typeof fetch = () => Promise.reject(NETWORK_FAILURE);

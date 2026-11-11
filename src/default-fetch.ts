export const defaultFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
  fetch(input, init);

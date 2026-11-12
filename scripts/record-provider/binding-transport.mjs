import { workersAiProxy } from "../workers-ai-proxy.mjs";

const REQUEST_ONLY_BINDING = { run: () => Promise.reject(new Error("request-only")) };

export async function bindingTransport(requestOnly) {
  if (requestOnly) return { binding: REQUEST_ONLY_BINDING, dispose: async () => {} };

  const proxy = await workersAiProxy();

  return { binding: proxy.env.AI, dispose: () => proxy.dispose() };
}

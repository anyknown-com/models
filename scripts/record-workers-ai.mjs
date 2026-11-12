import { writeFileSync } from "node:fs";
import { workersAiProxy } from "./workers-ai-proxy.mjs";

const fixturesDir = new URL("../test/wire/fixtures/workers-ai/", import.meta.url);
const proxy = await workersAiProxy();

const record = async (name, model, input) => {
  const output = await proxy.env.AI.run(model, input);
  const recorded = `${JSON.stringify({ model, input, output }, null, 2)}\n`;

  writeFileSync(new URL(`recorded-${name}.json`, fixturesDir), recorded);
};

try {
  await record("embed", "@cf/qwen/qwen3-embedding-0.6b", {
    text: ["segment 1", "segment 2", "segment 3"],
  });
  await record("rerank", "@cf/baai/bge-reranker-base", {
    query: "where did we meet",
    contexts: [
      { text: "Coffee\n\nWe met at the corner cafe." },
      { text: "Trip\n\nThe flight left at noon." },
      { text: "Dinner\n\nWe had dinner by the river." },
    ],
    top_k: 3,
  });
  await record("text", "@cf/meta/llama-3.2-3b-instruct", {
    messages: [
      {
        role: "system",
        content:
          "Rewrite the user's memory-search query into at most two alternative phrasings that would " +
          "match notes written in different words. Keep the user's language. Reply with one rewrite " +
          "per line, nothing else.",
      },
      { role: "user", content: "where did we meet" },
    ],
    max_tokens: 120,
  });
} finally {
  await proxy.dispose();
}

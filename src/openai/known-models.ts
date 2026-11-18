type OpenAIModel = { contextWindow: number; effortLevels: readonly string[] };

export const LOW_TO_HIGH = ["low", "medium", "high"];

const NONE_TO_MAX = ["none", "low", "medium", "high", "xhigh", "max"];

const LOW_TO_MAX = ["low", "medium", "high", "xhigh", "max"];

const NONE_TO_XHIGH = ["none", "low", "medium", "high", "xhigh"];

const LOW_TO_XHIGH = ["low", "medium", "high", "xhigh"];

const MEDIUM_TO_XHIGH = ["medium", "high", "xhigh"];

const NONE_TO_HIGH = ["none", "low", "medium", "high"];

const MINIMAL_TO_HIGH = ["minimal", "low", "medium", "high"];

// https://developers.openai.com/api/docs/models/all
export const KNOWN_MODELS: ReadonlyMap<string, OpenAIModel> = new Map([
  ["gpt-6.2-astra", { contextWindow: 1_050_000, effortLevels: LOW_TO_MAX }],
  ["gpt-6.2-sol", { contextWindow: 1_050_000, effortLevels: LOW_TO_MAX }],
  ["gpt-6.1-sol", { contextWindow: 1_050_000, effortLevels: LOW_TO_MAX }],
  ["gpt-6.1-terra", { contextWindow: 1_050_000, effortLevels: NONE_TO_MAX }],
  ["gpt-6-astra", { contextWindow: 1_050_000, effortLevels: LOW_TO_MAX }],
  ["gpt-6-sol", { contextWindow: 1_050_000, effortLevels: NONE_TO_MAX }],
  ["gpt-6-luna", { contextWindow: 1_050_000, effortLevels: NONE_TO_MAX }],
  ["gpt-6-cyber", { contextWindow: 1_050_000, effortLevels: LOW_TO_HIGH }],
  ["gpt-5.6-sol", { contextWindow: 1_050_000, effortLevels: NONE_TO_MAX }],
  ["gpt-5.6-terra", { contextWindow: 1_050_000, effortLevels: NONE_TO_MAX }],
  ["gpt-5.6-luna", { contextWindow: 1_050_000, effortLevels: NONE_TO_MAX }],
  ["gpt-5.6-cyber", { contextWindow: 400_000, effortLevels: LOW_TO_HIGH }],
  ["gpt-5.5", { contextWindow: 1_050_000, effortLevels: NONE_TO_XHIGH }],
  ["gpt-5.5-pro", { contextWindow: 1_050_000, effortLevels: MEDIUM_TO_XHIGH }],
  ["gpt-5.4", { contextWindow: 1_050_000, effortLevels: NONE_TO_XHIGH }],
  ["gpt-5.4-pro", { contextWindow: 1_050_000, effortLevels: MEDIUM_TO_XHIGH }],
  ["gpt-5.4-mini", { contextWindow: 400_000, effortLevels: NONE_TO_XHIGH }],
  ["gpt-5.4-nano", { contextWindow: 400_000, effortLevels: NONE_TO_XHIGH }],
  ["gpt-5.3-codex", { contextWindow: 400_000, effortLevels: LOW_TO_XHIGH }],
  ["gpt-5.2", { contextWindow: 400_000, effortLevels: NONE_TO_XHIGH }],
  ["gpt-5.2-pro", { contextWindow: 400_000, effortLevels: MEDIUM_TO_XHIGH }],
  ["gpt-5.1", { contextWindow: 400_000, effortLevels: NONE_TO_HIGH }],
  ["gpt-5", { contextWindow: 400_000, effortLevels: MINIMAL_TO_HIGH }],
  ["gpt-5-mini", { contextWindow: 400_000, effortLevels: MINIMAL_TO_HIGH }],
  ["gpt-5-nano", { contextWindow: 400_000, effortLevels: MINIMAL_TO_HIGH }],
  ["gpt-5-pro", { contextWindow: 400_000, effortLevels: ["high"] }],
  ["o3", { contextWindow: 200_000, effortLevels: LOW_TO_HIGH }],
  ["o3-pro", { contextWindow: 200_000, effortLevels: LOW_TO_HIGH }],
  ["chat-latest", { contextWindow: 400_000, effortLevels: [] }],
  ["gpt-4.1", { contextWindow: 1_047_576, effortLevels: [] }],
  ["gpt-4.1-mini", { contextWindow: 1_047_576, effortLevels: [] }],
  ["gpt-4o", { contextWindow: 128_000, effortLevels: [] }],
  ["gpt-4o-mini", { contextWindow: 128_000, effortLevels: [] }],
]);

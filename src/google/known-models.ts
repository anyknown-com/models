export const GEMINI_CONTEXT_WINDOW = 1_048_576;

// https://ai.google.dev/gemini-api/docs/models
export const KNOWN_MODELS: readonly string[] = [
  "gemini-4-carbon",
  "gemini-4-argon",
  "gemini-4-hydrogen",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-pro-preview-customtools",
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-001",
];

const LOW_TO_HIGH = ["low", "medium", "high"];

const MINIMAL_TO_HIGH = ["minimal", "low", "medium", "high"];

// https://ai.google.dev/gemini-api/docs/generate-content/thinking#levels-budgets
export const THINKING_LEVELS: ReadonlyMap<string, readonly string[]> = new Map([
  ["gemini-4-carbon", LOW_TO_HIGH],
  ["gemini-4-argon", LOW_TO_HIGH],
  ["gemini-4-hydrogen", [...LOW_TO_HIGH, "xhigh"]],
  ["gemini-3.8-flash", LOW_TO_HIGH],
  ["gemini-3.6-flash", MINIMAL_TO_HIGH],
  ["gemini-3.5-flash-lite", MINIMAL_TO_HIGH],
  ["gemini-3.1-pro-preview", LOW_TO_HIGH],
  ["gemini-3.1-flash-lite", MINIMAL_TO_HIGH],
  ["gemini-3.1-flash-lite-image", ["minimal", "high"]],
  ["gemini-3-flash-preview", MINIMAL_TO_HIGH],
  ["gemini-3-pro-preview", ["low", "high"]],
  ["gemini-robotics-er-2-preview", MINIMAL_TO_HIGH],
  ["gemini-2.5-pro", LOW_TO_HIGH],
  ["gemini-2.5-flash", LOW_TO_HIGH],
  ["gemini-2.5-flash-lite", LOW_TO_HIGH],
]);

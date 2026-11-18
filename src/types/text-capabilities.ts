export type TextCapabilities = {
  thinking: "adaptive" | "budget" | "none";
  effortLevels: readonly string[];
  contextWindow: number | null;
};

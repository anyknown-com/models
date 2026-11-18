import { describe, expect, it } from "vitest";
import { anthropic } from "../../../src/anthropic";

const capabilitiesOf = (model: string) => anthropic({ key: "k" }).capabilities(model);

describe("anthropic capabilities", () => {
  it.each([
    { model: "claude-opus-5-5", contextWindow: 1_000_000 },
    { model: "claude-haiku-5-5", contextWindow: 1_000_000 },
    { model: "anthropic.claude-sonnet-4-6", contextWindow: 1_000_000 },
    { model: "claude-sonnet-4-5-20250929", contextWindow: 200_000 },
    { model: "claude-opus-4-20250514", contextWindow: 200_000 },
    { model: "claude-3-haiku-20240307", contextWindow: null },
  ])("reports a context window of $contextWindow for $model", ({ model, contextWindow }) => {
    expect(capabilitiesOf(model).contextWindow).toBe(contextWindow);
  });

  it.each([
    "claude-fable-5-2",
    "claude-mythos-5-2",
    "claude-mythos-5-1",
    "claude-mythos-5",
    "claude-opus-5-5",
    "claude-sonnet-5-5",
    "claude-haiku-5-5",
  ])("keeps adaptive thinking and all five effort levels for %s", (model) => {
    expect(capabilitiesOf(model)).toEqual({
      thinking: "adaptive",
      effortLevels: ["low", "medium", "high", "xhigh", "max"],
      contextWindow: 1_000_000,
    });
  });
});

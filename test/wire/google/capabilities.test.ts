import { describe, expect, it } from "vitest";
import { google } from "../../../src/google";

const capabilitiesOf = (model: string) => google({ key: "k" }).capabilities(model);

describe("google capabilities", () => {
  it.each([
    { model: "gemini-4-carbon", contextWindow: 1_048_576 },
    { model: "models/gemini-2.5-flash", contextWindow: 1_048_576 },
    { model: "gemini-2.5-flash-image", contextWindow: null },
    { model: "tunedModels/mine", contextWindow: null },
  ])("reports a context window of $contextWindow for $model", ({ model, contextWindow }) => {
    expect(capabilitiesOf(model).contextWindow).toBe(contextWindow);
  });

  it.each([
    {
      model: "gemini-4-hydrogen",
      thinking: "adaptive",
      effortLevels: ["low", "medium", "high", "xhigh"],
    },
    { model: "models/gemini-3-pro-preview", thinking: "adaptive", effortLevels: ["low", "high"] },
    {
      model: "gemini-3.6-flash",
      thinking: "adaptive",
      effortLevels: ["minimal", "low", "medium", "high"],
    },
    { model: "gemini-2.5-flash", thinking: "budget", effortLevels: ["low", "medium", "high"] },
    { model: "gemini-2.0-flash", thinking: "none", effortLevels: [] },
  ])("reports the thinking levels of $model", ({ model, thinking, effortLevels }) => {
    expect(capabilitiesOf(model)).toMatchObject({ thinking, effortLevels });
  });
});

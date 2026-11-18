import { describe, expect, it } from "vitest";
import { openai } from "../../../src/openai";

const capabilitiesOf = (model: string) => openai({ key: "k" }).capabilities(model);

describe("openai capabilities", () => {
  it.each([
    {
      model: "gpt-6.2-sol",
      thinking: "adaptive",
      effortLevels: ["low", "medium", "high", "xhigh", "max"],
      contextWindow: 1_050_000,
    },
    {
      model: "gpt-6-luna",
      thinking: "adaptive",
      effortLevels: ["none", "low", "medium", "high", "xhigh", "max"],
      contextWindow: 1_050_000,
    },
    {
      model: "gpt-5-2025-08-07",
      thinking: "adaptive",
      effortLevels: ["minimal", "low", "medium", "high"],
      contextWindow: 400_000,
    },
    { model: "gpt-4o", thinking: "none", effortLevels: [], contextWindow: 128_000 },
    {
      model: "gpt-7-nova",
      thinking: "adaptive",
      effortLevels: ["low", "medium", "high"],
      contextWindow: null,
    },
    { model: "davinci-002", thinking: "none", effortLevels: [], contextWindow: null },
  ])("reports $model", ({ model, ...expected }) => {
    expect(capabilitiesOf(model)).toEqual(expected);
  });
});

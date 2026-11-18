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
    expect(capabilitiesOf(model)).toEqual({ thinking: "none", effortLevels: [], contextWindow });
  });
});

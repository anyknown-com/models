import type { TextRequest } from "../../src/types/text-request";
import { TEXT_CASES } from "./cases";
import type { TextCase } from "./cases";
import type { Manifest } from "./types";

const caseNamed = (id: string) => TEXT_CASES.find((textCase) => textCase.id === id);

const sourceOf = (textCase: TextCase) => {
  if ("fixtureOf" in textCase) return caseNamed(textCase.fixtureOf);
  if (textCase.source === "derived") return caseNamed(textCase.from);

  return textCase;
};

export function caseRequest(textCase: TextCase, manifest: Manifest): TextRequest {
  const source = sourceOf(textCase);
  const model = manifest.models["text"];

  if (!source || !("request" in source)) throw new Error(`${textCase.id} has no request`);
  if ("record" in source && source.record === "request-model") return source.request;
  if (model === undefined) throw new Error("manifest has no text model");

  return { ...source.request, model };
}

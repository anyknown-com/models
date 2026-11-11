import { fieldOf } from "../speech/field-of";
import { listOf } from "./list-of";

const contentWithoutData = (content: unknown): unknown =>
  fieldOf(content, "type") === "video"
    ? Object.fromEntries(Object.entries(content as object).filter(([key]) => key !== "data"))
    : content;

const stepWithoutData = (step: unknown): unknown =>
  Array.isArray(fieldOf(step, "content"))
    ? { ...(step as object), content: listOf(fieldOf(step, "content")).map(contentWithoutData) }
    : step;

export function withoutVideoData(body: unknown): unknown {
  const steps = fieldOf(body, "steps");

  if (!Array.isArray(steps)) return body;

  return { ...(body as object), steps: steps.map(stepWithoutData) };
}

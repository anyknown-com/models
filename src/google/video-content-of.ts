import { fieldOf } from "../speech/field-of";
import { listOf } from "./list-of";

export const videoContentOf = (body: unknown): unknown =>
  listOf(fieldOf(body, "steps"))
    .filter((step) => fieldOf(step, "type") === "model_output")
    .flatMap((step) => listOf(fieldOf(step, "content")))
    .find((content) => fieldOf(content, "type") === "video");

import type { VisualInput } from "../cases";

export const visualRequestOf = (input: VisualInput, model: string) => ({ ...input, model });

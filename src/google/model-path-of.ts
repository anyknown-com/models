export const modelPathOf = (model: string): string =>
  model.includes("/") ? model : `models/${model}`;

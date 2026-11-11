export const isToolPart = ({ type }: { type: string }): boolean =>
  type === "tool-call" || type === "tool-result";

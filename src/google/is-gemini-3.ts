const GEMINI = /(^|\/)gemini-/i;

const OLDER_GEMINI = [
  /(^|\/)gemini-1(?:[.-]|$)/i,
  /(^|\/)gemini-pro(?:-vision)?$/i,
  /(^|\/)gemini-robotics-er-1\.5(?:[.-]|$)/i,
  /(^|\/)gemini-2(?:[.-]|$)/i,
];

export const isGemini3 = (model: string): boolean =>
  GEMINI.test(model) && !OLDER_GEMINI.some((pattern) => pattern.test(model));

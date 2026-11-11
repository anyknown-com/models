const O_SERIES = /^o\d+(?:-|$)/;
const GPT = /^gpt-(\d+)(?:\.(\d+))?(?:-(.+))?$/;

export function isReasoningModel(model: string): boolean {
  if (O_SERIES.test(model)) return true;

  const gpt = GPT.exec(model);

  if (!gpt) return false;

  const [, major, minor, variant] = gpt;
  const isChat = minor === undefined && (variant?.startsWith("chat") ?? false);

  return Number(major) >= 5 && !isChat;
}

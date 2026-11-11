const OVERFLOW = new RegExp(
  [
    "prompt is too long",
    "input is too long for requested model",
    "too many input tokens",
    "too many total text bytes",
    "exceeds the context window",
    "context_length_exceeded",
    String.raw`maximum context length is \d+ tokens`,
    String.raw`too large for model with \d+ maximum context length`,
    "input token count.*exceeds the maximum number of tokens",
    String.raw`maximum prompt length is \d+`,
    "reduce the length of the messages",
  ].join("|"),
  "i",
);

export const isOverflow = (status: number, text: string): boolean =>
  status === 400 && OVERFLOW.test(text);

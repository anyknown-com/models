export function messageOf({ body, chunks }, secrets) {
  const message = body?.error?.message ?? body?.message ?? body?.error ?? chunks?.join("");
  const text = typeof message === "string" ? message : JSON.stringify(message ?? body);

  return secrets.reduce((masked, secret) => masked.replaceAll(secret, "<key>"), text);
}

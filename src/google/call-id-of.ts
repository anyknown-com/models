export const callIdOf = (id: string | null | undefined): string =>
  id || crypto.randomUUID().replaceAll("-", "").slice(0, 16);

export const bearerHeaders = (key: string): Record<string, string> => ({
  authorization: `Bearer ${key}`,
});

export function batchesOf<T>(values: T[], size: number): T[][] {
  const batches: T[][] = [];

  for (let start = 0; start < values.length; start += size) {
    batches.push(values.slice(start, start + size));
  }

  return batches;
}

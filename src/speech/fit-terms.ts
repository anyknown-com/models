const encoder = new TextEncoder();

export function fitTerms(terms: readonly string[], maxBytes: number, separator = ""): string[] {
  const separatorBytes = encoder.encode(separator).length;
  const kept: string[] = [];
  let used = 0;

  for (const term of terms) {
    const cost = encoder.encode(term).length + (kept.length > 0 ? separatorBytes : 0);

    if (used + cost > maxBytes) break;

    kept.push(term);
    used += cost;
  }

  return kept;
}

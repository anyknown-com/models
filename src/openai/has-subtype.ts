export const hasSubtype = (mediaType: string): boolean => /^[^/]+\/[^*]/.test(mediaType);

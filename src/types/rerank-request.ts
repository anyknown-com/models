export type RerankRequest = {
  model: string;
  query: string;
  documents: string[];
  topK?: number;
  signal?: AbortSignal;
};

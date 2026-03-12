export interface SemanticScore {
  slug: string;
  score: number;
}

interface EmbeddingsData {
  model: string;
  dimension: number;
  created_at?: string;
  posts: Record<string, number[]>;
}

let cachedEmbeddings: EmbeddingsData | null = null;
let initPromise: Promise<void> | null = null;

export async function loadEmbeddings(): Promise<EmbeddingsData> {
  if (cachedEmbeddings) return cachedEmbeddings;
  const response = await fetch("/embeddings.json");
  cachedEmbeddings = (await response.json()) as EmbeddingsData;
  return cachedEmbeddings;
}

export async function getEmbeddingsCreatedAt(): Promise<string | null> {
  const data = await loadEmbeddings();
  return data.created_at ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractor: any = null;

export async function initializeModel(): Promise<void> {
  if (extractor) return;
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    const { pipeline } = await import("@huggingface/transformers");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  })();

  await initPromise;
}

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export async function semanticSearch(query: string): Promise<SemanticScore[]> {
  await initializeModel();
  const embeddings = await loadEmbeddings();

  const output = await extractor(query, { pooling: "mean", normalize: true });
  const queryEmbedding: number[] = output.tolist()[0];

  const results: SemanticScore[] = [];
  for (const [slug, postEmbedding] of Object.entries(embeddings.posts)) {
    const score = dotProduct(queryEmbedding, postEmbedding);
    results.push({ slug, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

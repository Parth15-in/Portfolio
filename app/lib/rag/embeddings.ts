import type { FeatureExtractionPipeline } from "@xenova/transformers";

// Global cache for the local pipeline instance to avoid reloading weights
let localPipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

async function getLocalPipeline(): Promise<FeatureExtractionPipeline> {
  if (!localPipelinePromise) {
    localPipelinePromise = (async () => {
      // Dynamic import to support both Node and Next.js server environments
      const { pipeline, env } = await import("@xenova/transformers");
      // Allow remote models to be fetched and cached in Node's cache dir
      env.allowLocalModels = false;
      env.useBrowserCache = false;
      return pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    })();
  }
  return localPipelinePromise;
}

/**
 * Generate embedding for a single text string using Xenova all-MiniLM-L6-v2 (384 dimensions)
 * or OpenAI text-embedding-3-small (if explicitly configured via EMBEDDING_PROVIDER=openai).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = process.env.EMBEDDING_PROVIDER || "local";

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return generateOpenAIEmbedding(text);
  }

  return generateLocalEmbedding(text);
}

/**
 * Batch generate embeddings for multiple texts.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const provider = process.env.EMBEDDING_PROVIDER || "local";

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return Promise.all(texts.map(t => generateOpenAIEmbedding(t)));
  }

  const pipe = await getLocalPipeline();
  const results: number[][] = [];

  for (const text of texts) {
    const clean = text.replace(/\n+/g, " ").trim();
    const output = await pipe(clean, { pooling: "mean", normalize: true });
    results.push(Array.from(output.data as Float32Array));
  }

  return results;
}

async function generateLocalEmbedding(text: string): Promise<number[]> {
  const pipe = await getLocalPipeline();
  const clean = text.replace(/\n+/g, " ").trim();
  const output = await pipe(clean, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured for OpenAI embeddings");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

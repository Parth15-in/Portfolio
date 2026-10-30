import { Pinecone } from "@pinecone-database/pinecone";
import type { DocumentChunk, QueryResult } from "./types";

let pineconeClient: Pinecone | null = null;

export function isPineconeConfigured(): boolean {
  return Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX);
}

function getPineconeIndex() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX;

  if (!apiKey || !indexName) {
    return null;
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey });
  }

  return pineconeClient.index(indexName);
}

/**
 * Upsert records into Pinecone index.
 */
export async function upsertToPinecone(
  chunks: DocumentChunk[],
  embeddings: number[][]
): Promise<boolean> {
  const index = getPineconeIndex();
  if (!index) return false;

  try {
    const vectors = chunks.map((chunk, i) => ({
      id: chunk.id,
      values: embeddings[i],
      metadata: {
        ...chunk.metadata,
        content: chunk.content,
        contentHash: chunk.contentHash,
      },
    }));

    // Pinecone recommends batches of up to 100 vectors
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert({ records: batch as any });
    }

    return true;
  } catch (err) {
    console.error("[Pinecone] Upsert failed:", err);
    return false;
  }
}

/**
 * Query Pinecone for top-K matching records.
 */
export async function queryPinecone(
  queryVector: number[],
  topK = 4,
  minScore = 0.35,
  filter?: Record<string, unknown>
): Promise<QueryResult[]> {
  const index = getPineconeIndex();
  if (!index) return [];

  try {
    const res = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter: filter as Record<string, any>,
    });

    const results: QueryResult[] = [];

    for (const match of res.matches || []) {
      const score = match.score ?? 0;
      if (score < minScore) continue;

      const meta = (match.metadata || {}) as any;
      results.push({
        score,
        chunk: {
          id: match.id,
          content: meta.content || "",
          contentHash: meta.contentHash || "",
          metadata: {
            source: meta.source || "portfolio",
            category: meta.category || "about",
            section: meta.section || "",
            projectName: meta.projectName,
            sourceFile: meta.sourceFile || "",
            url: meta.url,
            updatedAt: meta.updatedAt || new Date().toISOString(),
          },
        },
      });
    }

    return results;
  } catch (err) {
    console.error("[Pinecone] Query failed, will fall back to local store:", err);
    return [];
  }
}

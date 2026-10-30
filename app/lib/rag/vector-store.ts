import type { DocumentChunk, QueryResult } from "./types";
import { LocalVectorStore } from "./local-vector-store";
import { isPineconeConfigured, queryPinecone, upsertToPinecone } from "./pinecone-client";

export function getActiveVectorStoreName(): string {
  if (isPineconeConfigured()) {
    return `Pinecone Index (${process.env.PINECONE_INDEX})`;
  }
  return "Local Vector Index (LocalStore)";
}

/**
 * Upsert chunks and their embeddings to the configured vector store.
 * Always keeps local store synchronized as a zero-latency fallback cache.
 */
export async function upsertChunks(
  chunks: DocumentChunk[],
  embeddings: number[][]
): Promise<{ pineconeSuccess: boolean; localSuccess: boolean }> {
  // Always update local index
  LocalVectorStore.upsert(chunks, embeddings);
  let pineconeSuccess = false;

  if (isPineconeConfigured()) {
    pineconeSuccess = await upsertToPinecone(chunks, embeddings);
  }

  return { pineconeSuccess, localSuccess: true };
}

/**
 * Query the vector store for most relevant document chunks.
 * Falls back to local store if Pinecone query fails or is not configured.
 */
export async function queryVectorStore(
  queryVector: number[],
  topK = 4,
  minScore = 0.3,
  filter?: Record<string, unknown>
): Promise<QueryResult[]> {
  if (isPineconeConfigured()) {
    const pineconeResults = await queryPinecone(queryVector, topK, minScore, filter);
    if (pineconeResults.length > 0) {
      return pineconeResults;
    }
  }

  // Fallback to local store
  return LocalVectorStore.query(queryVector, topK, minScore, filter);
}

export function getAllIndexedChunks(): DocumentChunk[] {
  const records = LocalVectorStore.getAll();
  return records.map(r => ({
    id: r.id,
    content: r.metadata.content,
    contentHash: r.metadata.contentHash,
    metadata: r.metadata,
  }));
}

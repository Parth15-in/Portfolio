import fs from "fs";
import path from "path";
import type { DocumentChunk, QueryResult, VectorRecord } from "./types";

const INDEX_FILE = path.join(process.cwd(), "app", "lib", "rag", "vector-index.json");

interface LocalStoreData {
  version: number;
  model: string;
  dimension: number;
  updatedAt: string;
  records: VectorRecord[];
}

/**
 * Computes cosine similarity between two normalized vectors.
 * If vectors are normalized to unit length, cosine similarity = dot product.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

let inMemoryRecords: VectorRecord[] | null = null;

function loadRecords(): VectorRecord[] {
  if (inMemoryRecords) return inMemoryRecords;

  try {
    if (fs.existsSync(INDEX_FILE)) {
      const content = fs.readFileSync(INDEX_FILE, "utf-8");
      const data = JSON.parse(content) as LocalStoreData;
      inMemoryRecords = data.records || [];
      return inMemoryRecords;
    }
  } catch (err) {
    console.error("[LocalVectorStore] Error reading index file:", err);
  }

  inMemoryRecords = [];
  return inMemoryRecords;
}

function saveRecords(records: VectorRecord[]): void {
  inMemoryRecords = records;
  try {
    const dir = path.dirname(INDEX_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data: LocalStoreData = {
      version: 1,
      model: process.env.EMBEDDING_PROVIDER === "openai" ? "text-embedding-3-small" : "Xenova/all-MiniLM-L6-v2",
      dimension: records.length > 0 ? records[0].values.length : 384,
      updatedAt: new Date().toISOString(),
      records,
    };

    fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[LocalVectorStore] Error writing index file:", err);
  }
}

export class LocalVectorStore {
  /**
   * Search for top-K most similar chunks to the query vector.
   */
  static query(
    queryVector: number[],
    topK = 4,
    minScore = 0.3,
    filter?: Partial<Record<string, unknown>>
  ): QueryResult[] {
    const records = loadRecords();
    if (records.length === 0) return [];

    const scored: { record: VectorRecord; score: number }[] = [];

    for (const record of records) {
      // Apply metadata filter if specified
      if (filter) {
        let match = true;
        for (const [key, value] of Object.entries(filter)) {
          if ((record.metadata as Record<string, unknown>)[key] !== value) {
            match = false;
            break;
          }
        }
        if (!match) continue;
      }

      const score = cosineSimilarity(queryVector, record.values);
      if (score >= minScore) {
        scored.push({ record, score });
      }
    }

    // Sort by descending score
    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, topK);

    return top.map(item => ({
      score: item.score,
      chunk: {
        id: item.record.id,
        content: item.record.metadata.content,
        contentHash: item.record.metadata.contentHash,
        metadata: item.record.metadata,
      },
    }));
  }

  /**
   * Upsert chunks and their embedding vectors into the local store.
   */
  static upsert(chunks: DocumentChunk[], embeddings: number[][]): void {
    const records = [...loadRecords()];
    const recordMap = new Map<string, VectorRecord>();

    for (const rec of records) {
      recordMap.set(rec.id, rec);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const values = embeddings[i];

      const record: VectorRecord = {
        id: chunk.id,
        values,
        metadata: {
          ...chunk.metadata,
          content: chunk.content,
          contentHash: chunk.contentHash,
        },
      };

      recordMap.set(chunk.id, record);
    }

    saveRecords(Array.from(recordMap.values()));
  }

  /**
   * Get all currently indexed records.
   */
  static getAll(): VectorRecord[] {
    return loadRecords();
  }

  /**
   * Delete records matching given IDs.
   */
  static delete(ids: string[]): void {
    const idSet = new Set(ids);
    const records = loadRecords().filter(r => !idSet.has(r.id));
    saveRecords(records);
  }
}

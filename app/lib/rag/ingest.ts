import { extractAllKnowledge } from "./extractor";
import { generateEmbeddings } from "./embeddings";
import { upsertChunks, getActiveVectorStoreName, getAllIndexedChunks } from "./vector-store";
import { LocalVectorStore } from "./local-vector-store";
import type { DocumentChunk, IngestionStats } from "./types";

/**
 * Runs the full ingestion pipeline:
 * 1. Extracts portfolio data and resume PDF text.
 * 2. Checks content hashes for idempotency.
 * 3. Generates embeddings for new/modified chunks.
 * 4. Indexes chunks to Pinecone and/or local vector store.
 * 5. Cleans up obsolete chunks.
 */
export async function runIngestion(): Promise<IngestionStats> {
  const startTime = Date.now();
  console.log("=================================================");
  console.log("  🚀 Starting AI Portfolio Knowledge Ingestion   ");
  console.log("=================================================");

  // 1. Extract chunks
  console.log("\n[1/4] Extracting portfolio content and parsing resume PDF...");
  const extractedChunks = await extractAllKnowledge();
  console.log(`✓ Extracted ${extractedChunks.length} document chunks.`);

  // 2. Identify changed chunks
  console.log("\n[2/4] Checking existing indexed records for changes...");
  const existingRecords = LocalVectorStore.getAll();
  const existingMap = new Map(existingRecords.map(r => [r.id, r]));

  const chunksToEmbed: DocumentChunk[] = [];
  const existingVectorsMap = new Map<string, number[]>();

  let newCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  for (const chunk of extractedChunks) {
    const existing = existingMap.get(chunk.id);
    if (!existing) {
      chunksToEmbed.push(chunk);
      newCount++;
    } else if (existing.metadata.contentHash !== chunk.contentHash) {
      chunksToEmbed.push(chunk);
      updatedCount++;
    } else {
      unchangedCount++;
      existingVectorsMap.set(chunk.id, existing.values);
    }
  }

  console.log(`- New chunks: ${newCount}`);
  console.log(`- Updated chunks: ${updatedCount}`);
  console.log(`- Unchanged chunks: ${unchangedCount}`);

  // 3. Generate embeddings
  let newEmbeddings: number[][] = [];
  if (chunksToEmbed.length > 0) {
    console.log(`\n[3/4] Generating embeddings for ${chunksToEmbed.length} chunks...`);
    const texts = chunksToEmbed.map(c => c.content);
    newEmbeddings = await generateEmbeddings(texts);
    console.log(`✓ Generated ${newEmbeddings.length} embeddings.`);
  } else {
    console.log("\n[3/4] All chunks are up-to-date. Skipping embedding generation.");
  }

  // Combine all chunks and embeddings for the final index
  const allFinalChunks: DocumentChunk[] = [];
  const allFinalEmbeddings: number[][] = [];

  // Add updated/new
  for (let i = 0; i < chunksToEmbed.length; i++) {
    allFinalChunks.push(chunksToEmbed[i]);
    allFinalEmbeddings.push(newEmbeddings[i]);
  }

  // Add unchanged
  for (const chunk of extractedChunks) {
    const existingVec = existingVectorsMap.get(chunk.id);
    if (existingVec && !chunksToEmbed.some(c => c.id === chunk.id)) {
      allFinalChunks.push(chunk);
      allFinalEmbeddings.push(existingVec);
    }
  }

  // 4. Upsert to vector store
  const targetStore = getActiveVectorStoreName();
  console.log(`\n[4/4] Upserting to vector store: ${targetStore}...`);
  await upsertChunks(allFinalChunks, allFinalEmbeddings);

  // Clean up obsolete chunks
  const currentIds = new Set(extractedChunks.map(c => c.id));
  const obsoleteIds = existingRecords
    .filter(r => !currentIds.has(r.id))
    .map(r => r.id);

  if (obsoleteIds.length > 0) {
    console.log(`- Cleaning up ${obsoleteIds.length} obsolete chunks...`);
    LocalVectorStore.delete(obsoleteIds);
  }

  const durationMs = Date.now() - startTime;
  const categories: Record<string, number> = {};
  for (const c of extractedChunks) {
    categories[c.metadata.category] = (categories[c.metadata.category] || 0) + 1;
  }

  console.log("\n=================================================");
  console.log("  ✅ Ingestion Successfully Completed!          ");
  console.log(`  Total Chunks: ${extractedChunks.length}`);
  console.log(`  Duration: ${(durationMs / 1000).toFixed(2)}s`);
  console.log("  Categories indexed:");
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`    • ${cat}: ${count} chunks`);
  }
  console.log("=================================================\n");

  return {
    totalChunks: extractedChunks.length,
    newChunks: newCount,
    updatedChunks: updatedCount,
    unchangedChunks: unchangedCount,
    categories,
    vectorStoreTarget: targetStore,
    durationMs,
  };
}

// If executed directly from CLI via `npm run ingest` or `tsx ingest.ts`
if (require.main === module || process.argv[1]?.includes("ingest")) {
  runIngestion()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\n❌ Ingestion failed with error:", err);
      process.exit(1);
    });
}

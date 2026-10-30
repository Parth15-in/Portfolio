import type { ChatMessage, QueryResult } from "./types";
import { generateEmbedding } from "./embeddings";
import { queryVectorStore } from "./vector-store";
import { LocalVectorStore } from "./local-vector-store";

const DEFAULT_TOP_K = parseInt(process.env.RAG_TOP_K || "4", 10);
const DEFAULT_SIMILARITY_THRESHOLD = parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.28");

/**
 * Contextualizes follow-up questions using recent conversation history.
 * E.g., If previous message was about "QuizLab", and question is "What database does it use?",
 * the query is expanded to include "QuizLab".
 */
export function contextualizeQuery(query: string, history: ChatMessage[]): string {
  const clean = query.trim();
  if (history.length === 0) return clean;

  const lower = clean.toLowerCase();
  const pronouns = ["it", "this", "that", "these", "those", "they", "he", "his", "him", "the project", "the platform", "the app"];
  const hasPronoun = pronouns.some(p => lower.includes(` ${p} `) || lower.startsWith(`${p} `) || lower.endsWith(` ${p}`));

  if (!hasPronoun && clean.length > 25) {
    return clean;
  }

  // Look back at the last user message and assistant message for key entities
  const lastUserMsg = [...history].reverse().find(m => m.role === "user")?.content || "";
  const entities = ["quizlab", "mockmingle", "shakktii", "hardware shop", "patent", "visualathon", "mit", "internship"];

  for (const entity of entities) {
    if (lastUserMsg.toLowerCase().includes(entity) && !lower.includes(entity)) {
      return `${clean} (context: ${entity})`;
    }
  }

  return clean;
}

/**
 * Executes hybrid semantic + keyword retrieval pipeline.
 * Fully resilient: if vector embeddings fail or are unavailable (e.g. serverless cold-start),
 * falls back seamlessly to token-based keyword and entity scoring.
 */
export async function retrieveRelevantChunks(
  query: string,
  history: ChatMessage[] = [],
  topK = DEFAULT_TOP_K,
  minScore = DEFAULT_SIMILARITY_THRESHOLD
): Promise<QueryResult[]> {
  const expandedQuery = contextualizeQuery(query, history);
  let queryEmbedding: number[] | null = null;

  try {
    queryEmbedding = await generateEmbedding(expandedQuery);
  } catch (err) {
    console.warn("[retrieveRelevantChunks] Embedding generation skipped:", err);
  }

  // Retrieve candidate pool with lower floor for hybrid re-ranking
  let candidatePool: QueryResult[] = [];
  if (queryEmbedding && Array.isArray(queryEmbedding) && queryEmbedding.length > 0) {
    try {
      candidatePool = await queryVectorStore(queryEmbedding, 15, 0.15);
    } catch (err) {
      console.warn("[retrieveRelevantChunks] Vector store query failed:", err);
    }
  }

  // If candidatePool is empty (e.g. cold start, embedding skipped, or serverless memory limit),
  // seed from all statically bundled records
  if (candidatePool.length === 0) {
    const allRecords = LocalVectorStore.getAll();
    candidatePool = allRecords.map(r => ({
      score: 0.25,
      chunk: {
        id: r.id,
        content: r.metadata.content,
        contentHash: r.metadata.contentHash,
        metadata: r.metadata,
      },
    }));
  }

  const lowerQuery = query.toLowerCase();

  // Significant entity keywords and aliases
  const entityKeywords: Record<string, string[]> = {
    mockmingle: ["mockmingle", "mock mingle", "interview", "prompt"],
    shakktii: ["shakktii", "shakti", "shaktii", "internship", "intern"],
    quizlab: ["quizlab", "quiz lab", "quiz", "nextauth", "oauth", "groq", "groqai"],
    "hardware shop": ["hardware shop", "hardware", "pos", "pricing", "credit", "electron"],
    patent: ["patent", "gesture", "mouse", "touchless", "wearable", "finger band", "sensor"],
    visualathon: ["visualathon", "irctc", "silver medal", "railway", "train", "booking"],
    education: ["education", "mit", "wpu", "degree", "college", "gpa", "cgpa"],
    internship: ["internship", "intern", "shakktii"],
    backend: ["backend", "database", "api", "rest", "postgres", "postgresql", "prisma", "node", "express", "mongodb", "latency", "jwt", "payload"],
    achievements: ["achievement", "achievements", "award", "awards", "medal", "patent"],
  };

  // Extract query terms for term matching
  const stopWords = new Set(["what", "which", "where", "when", "tell", "about", "his", "parth", "does", "have", "with", "this", "that", "these", "those", "from", "into"]);
  const queryTerms = lowerQuery
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  const scoredResults: QueryResult[] = [];

  for (const r of candidatePool) {
    let bonus = 0;
    const chunkLower = (r.chunk.content || "").toLowerCase();
    const sectionLower = (r.chunk.metadata.section || "").toLowerCase();
    const projectLower = (r.chunk.metadata.projectName || "").toLowerCase();

    // 1. Entity keyword matching
    for (const [entity, aliases] of Object.entries(entityKeywords)) {
      const queryMentionsEntity = aliases.some(a => lowerQuery.includes(a));
      if (queryMentionsEntity) {
        if (chunkLower.includes(entity) || sectionLower.includes(entity) || projectLower.includes(entity)) {
          bonus += 0.22;
        }
      }
    }

    // 2. Direct term frequency matching
    let matchedTerms = 0;
    for (const term of queryTerms) {
      if (sectionLower.includes(term) || projectLower.includes(term)) {
        matchedTerms += 1.5;
      } else if (chunkLower.includes(term)) {
        matchedTerms += 1;
      }
    }

    if (queryTerms.length > 0 && matchedTerms > 0) {
      bonus += Math.min(0.35, (matchedTerms / queryTerms.length) * 0.35);
    }

    const hybridScore = Math.min(1.0, r.score + bonus);

    if (hybridScore >= minScore) {
      scoredResults.push({
        chunk: r.chunk,
        score: hybridScore,
      });
    }
  }

  // If strict filtering removed everything, fallback to top scored candidates
  if (scoredResults.length === 0 && candidatePool.length > 0) {
    return candidatePool.slice(0, topK);
  }

  // Sort descending by hybrid score
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.slice(0, topK);
}

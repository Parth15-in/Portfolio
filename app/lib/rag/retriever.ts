import type { ChatMessage, QueryResult } from "./types";
import { generateEmbedding } from "./embeddings";
import { queryVectorStore } from "./vector-store";

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
 */
export async function retrieveRelevantChunks(
  query: string,
  history: ChatMessage[] = [],
  topK = DEFAULT_TOP_K,
  minScore = DEFAULT_SIMILARITY_THRESHOLD
): Promise<QueryResult[]> {
  const expandedQuery = contextualizeQuery(query, history);
  const queryEmbedding = await generateEmbedding(expandedQuery);

  // Retrieve candidate pool with lower floor for hybrid re-ranking
  const candidatePool = await queryVectorStore(queryEmbedding, 15, 0.15);

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

  const scoredResults: QueryResult[] = [];

  for (const r of candidatePool) {
    let bonus = 0;
    const chunkLower = r.chunk.content.toLowerCase();
    const sectionLower = r.chunk.metadata.section.toLowerCase();

    for (const [entity, aliases] of Object.entries(entityKeywords)) {
      const queryMentionsEntity = aliases.some(a => lowerQuery.includes(a));
      if (queryMentionsEntity) {
        if (chunkLower.includes(entity) || sectionLower.includes(entity)) {
          bonus += 0.18;
        }
      }
    }

    const hybridScore = Math.min(1.0, r.score + bonus);

    if (hybridScore >= minScore) {
      scoredResults.push({
        chunk: r.chunk,
        score: hybridScore,
      });
    }
  }

  // Sort descending by hybrid score
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.slice(0, topK);
}

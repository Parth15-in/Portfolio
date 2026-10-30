export type KnowledgeSource = "portfolio" | "resume" | "docs";

export type KnowledgeCategory =
  | "about"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "achievements"
  | "contact"
  | "highlights";

export interface DocumentMetadata {
  source: KnowledgeSource;
  category: KnowledgeCategory;
  section: string;
  projectName?: string;
  sourceFile: string;
  url?: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface DocumentChunk {
  id: string;
  content: string;
  contentHash: string;
  metadata: DocumentMetadata;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: DocumentMetadata & { content: string; contentHash: string };
}

export interface QueryResult {
  chunk: DocumentChunk;
  score: number;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SourceReference {
  title: string;
  category: string;
  source: string;
  url?: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceReference[];
  suggestedQuestions?: string[];
  retrievalCount: number;
}

export interface IngestionStats {
  totalChunks: number;
  newChunks: number;
  updatedChunks: number;
  unchangedChunks: number;
  categories: Record<string, number>;
  vectorStoreTarget: string;
  durationMs: number;
}

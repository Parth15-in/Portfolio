import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantChunks } from "@/app/lib/rag/retriever";
import { generateRAGAnswer } from "@/app/lib/rag/groq-client";
import type { ChatMessage } from "@/app/lib/rag/types";

// In-memory sliding window rate limiter
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.timestamps.push(now);
  rateLimitMap.set(ip, record);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a moment before asking another question.",
        },
        { status: 429 }
      );
    }

    // 2. Body parsing and validation
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { message, history } = body || {};

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "A message string is required." },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();
    if (cleanMessage.length > 500) {
      return NextResponse.json(
        { error: "Message exceeds maximum allowed length of 500 characters." },
        { status: 400 }
      );
    }

    // Validate history
    const validatedHistory: ChatMessage[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
        ) {
          validatedHistory.push({
            role: item.role,
            content: item.content.slice(0, 1000), // sanitize length
          });
        }
      }
    }

    // Check if Groq API key is present
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          answer:
            "I'm currently unable to process your request because the Groq API key is not configured. Please add `GROQ_API_KEY` to `.env.local` to enable AI responses.",
          sources: [],
          suggestedQuestions: [
            "Tell me about Parth's education.",
            "What did Parth do at Shakktii AI?",
            "What projects has he built?",
          ],
        },
        { status: 200 }
      );
    }

    // 3. RAG Semantic Retrieval
    const retrievedChunks = await retrieveRelevantChunks(cleanMessage, validatedHistory);

    // 4. Groq Answer Generation
    const response = await generateRAGAnswer(cleanMessage, retrievedChunks, validatedHistory);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("[API /api/chat] Error handling chat request:", error);

    // Never leak internal stack traces or configuration
    const userMessage = error?.message?.includes("GROQ_API_KEY")
      ? "Groq API key is missing or invalid. Please check server configuration."
      : "I ran into a temporary issue retrieving an answer. Please try asking again in a moment.";

    return NextResponse.json(
      {
        answer: userMessage,
        sources: [],
        suggestedQuestions: [
          "Tell me about Parth's education.",
          "What did Parth do during his internship?",
          "Which projects use Next.js?",
        ],
      },
      { status: 500 }
    );
  }
}

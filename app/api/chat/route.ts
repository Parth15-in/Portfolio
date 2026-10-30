import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantChunks } from "@/app/lib/rag/retriever";
import { generateRAGAnswer, getGroqApiKey } from "@/app/lib/rag/groq-client";
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

    // Check if Groq API key is present (checks GROQ_API_KEY, GROQ_KEY, GROQ_API, GROQ)
    const apiKey = getGroqApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Groq API key is not configured.",
          answer:
            "I'm currently unable to process your question because the Groq API key is not active on this deployment.\n\n**To resolve:**\n1. In your **Vercel Dashboard**, go to **Settings > Environment Variables**.\n2. Ensure the key name is **`GROQ_API_KEY`** with your valid Groq key.\n3. Go to the **Deployments** tab and click **Redeploy** (environment variables only take effect on new deployments).",
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

    // 3. RAG Semantic & Keyword Retrieval
    const retrievedChunks = await retrieveRelevantChunks(cleanMessage, validatedHistory);

    // 4. Groq Answer Generation
    const response = await generateRAGAnswer(cleanMessage, retrievedChunks, validatedHistory);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("[API /api/chat] Error handling chat request:", error);

    const isApiKeyError =
      error?.message?.includes("GROQ_API_KEY") ||
      error?.status === 401 ||
      error?.message?.includes("401");

    const userMessage = isApiKeyError
      ? "Groq API key appears invalid or expired. Please check your GROQ_API_KEY in Vercel Environment Variables and redeploy."
      : (error?.message || "I ran into a temporary issue retrieving an answer. Please try asking again in a moment.");

    return NextResponse.json(
      {
        error: userMessage,
        answer: userMessage,
        sources: [],
        suggestedQuestions: [
          "Tell me about Parth's education.",
          "What did Parth do during his internship?",
          "Which projects use Next.js?",
        ],
      },
      { status: 200 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { analyzeJobDescription } from "@/app/lib/rag/jd-analyzer";
import { getGroqApiKey } from "@/app/lib/rag/groq-client";
import { validateJobDescriptionText } from "@/app/lib/rag/jd-validator";

// Separate rate limits for JD analysis (heavier than chat)
interface RateLimitRecord {
  timestamps: number[];
}
const jdRateLimitMap = new Map<string, RateLimitRecord>();
const JD_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const JD_MAX_REQUESTS_PER_WINDOW = 5;

function checkJDRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = jdRateLimitMap.get(ip) || { timestamps: [] };
  record.timestamps = record.timestamps.filter(t => now - t < JD_RATE_LIMIT_WINDOW_MS);

  if (record.timestamps.length >= JD_MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.timestamps.push(now);
  jdRateLimitMap.set(ip, record);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (!checkJDRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many JD analysis requests. Please wait a minute before analyzing another JD." },
        { status: 429 }
      );
    }

    // 2. Parse and validate body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const { jobDescription } = body || {};

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "A job description string is required." },
        { status: 400 }
      );
    }

    const trimmed = jobDescription.trim();

    // Validate if the input is a genuine job description
    const validation = validateJobDescriptionText(trimmed);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.reason || "Please provide a valid job description." },
        { status: 400 }
      );
    }

    if (trimmed.length > 6000) {
      return NextResponse.json(
        { error: "Job description is too long. Please paste the key sections (max 6000 characters)." },
        { status: 400 }
      );
    }

    // 3. Check API key
    if (!getGroqApiKey()) {
      return NextResponse.json(
        { error: "Groq API key is not configured. Please add GROQ_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    // 4. Run JD analysis
    const result = await analyzeJobDescription(trimmed);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[API /api/analyze-jd] Error:", error);

    const userMessage = error?.message?.includes("GROQ_API_KEY")
      ? "Groq API key is missing or invalid."
      : error?.message || "Failed to analyze the job description. Please try again.";

    return NextResponse.json({ error: userMessage }, { status: 400 });
  }
}

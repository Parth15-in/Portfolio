import { Groq } from "groq-sdk";
import { retrieveRelevantChunks } from "./retriever";
import { getGroqApiKey } from "./groq-client";
import type { QueryResult } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillMatch {
  skill: string;
  matchType: "demonstrated" | "related" | "not-documented";
  evidence: string;
}

export interface ProjectMatch {
  name: string;
  relevance: string;
  skills: string[];
}

export interface JDAnalysisResult {
  jobTitle: string;
  companyName: string;
  matchScore: number;
  matchCategory: "Strong Match" | "Good Match" | "Moderate Match" | "Limited Match";
  summary: string;
  skillMatches: SkillMatch[];
  relevantProjects: ProjectMatch[];
  keyStrengths: string[];
  potentialGaps: string[];
  recruiterRecommendation: string;
  followUpQuestions: string[];
  // Scoring breakdown
  scoringBreakdown: {
    technicalSkills: { score: number; weight: number; maxScore: number };
    projectExperience: { score: number; weight: number; maxScore: number };
    responsibilities: { score: number; weight: number; maxScore: number };
    preferredSkills: { score: number; weight: number; maxScore: number };
    education: { score: number; weight: number; maxScore: number };
  };
}

// ─── Prompt-injection sanitisation ───────────────────────────────────────────

function sanitizeJD(jd: string): string {
  // Remove any embedded instruction-like patterns that could attempt prompt injection
  return jd
    .replace(/ignore (previous|all|above|prior) (instructions?|prompts?|rules?)/gi, "[REDACTED]")
    .replace(/system\s*prompt/gi, "[REDACTED]")
    .replace(/you are now/gi, "[REDACTED]")
    .replace(/act as/gi, "[REDACTED]")
    .replace(/\[INST\]/gi, "[REDACTED]")
    .replace(/\[\/INST\]/gi, "[REDACTED]")
    .slice(0, 4000); // Hard cap on JD length
}

// ─── Portfolio knowledge retrieval for JD analysis ───────────────────────────

async function retrievePortfolioForJD(): Promise<string> {
  // Pull a broad set of portfolio chunks to give the LLM maximum coverage
  const queries = [
    "technical skills programming languages frameworks",
    "projects QuizLab Hardware Shop internship experience",
    "education achievements internship Shakktii AI MongoDB React Node",
    "REST API backend database PostgreSQL full stack",
  ];

  const allChunks = new Map<string, QueryResult>();

  for (const q of queries) {
    const results = await retrieveRelevantChunks(q, [], 6, 0.1);
    for (const r of results) {
      if (!allChunks.has(r.chunk.id)) {
        allChunks.set(r.chunk.id, r);
      }
    }
  }

  // Sort by score descending and build context block
  const sorted = Array.from(allChunks.values()).sort((a, b) => b.score - a.score);
  return sorted
    .slice(0, 18) // Top 18 unique chunks
    .map(
      (r, i) =>
        `[Portfolio Chunk ${i + 1}] (${r.chunk.metadata.source.toUpperCase()} — ${r.chunk.metadata.section}):\n${r.chunk.content}`
    )
    .join("\n\n---\n\n");
}

// ─── Main analysis function ───────────────────────────────────────────────────

export async function analyzeJobDescription(rawJD: string): Promise<JDAnalysisResult> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  const cleanJD = sanitizeJD(rawJD);
  const portfolioContext = await retrievePortfolioForJD();

  const systemPrompt = `You are an expert technical recruiter and career advisor analyzing a candidate's profile against a job description.

Your task is to match the candidate's verified portfolio and resume against the JD requirements and produce a structured, HONEST, and POSITIVE analysis.

CRITICAL RULES:
1. Only use the verified portfolio evidence provided. NEVER fabricate skills, certifications, experiences, or projects.
2. Recognize transferable and related skills generously. A candidate who has used React.js professionally and Next.js in projects clearly understands modern JS frameworks.
3. Give full credit for documented internship experience and academic projects — this is an early-career candidate.
4. Use THREE match categories:
   - "demonstrated": Direct evidence exists in the portfolio/resume.
   - "related": Transferable skill or related technology is documented.
   - "not-documented": No supporting evidence exists at all.
5. Match score is CALCULATED from a weighted formula — do not invent it. Use the scoring criteria below.
6. Keep gaps brief and constructive. Do not make the analysis negative.
7. The recommendation must be genuinely positive where evidence supports it.
8. Do not penalize missing years of experience for an early-career candidate.

SCORING WEIGHTS (sum to 100):
- Required Technical Skills: 40 points max
- Projects & Practical Experience: 25 points max
- Job Responsibilities Alignment: 15 points max
- Preferred Skills: 10 points max
- Education & Qualifications: 10 points max

For each category, score 0–100% of the max points based on how well the profile matches.

SCORE CATEGORIES:
- 80–100: Strong Match
- 60–79: Good Match
- 40–59: Moderate Match
- Below 40: Limited Match

RETURN ONLY A VALID JSON OBJECT matching this exact TypeScript interface:
{
  "jobTitle": string,
  "companyName": string (or "Not specified"),
  "summary": string (2–3 sentences, positive and honest),
  "skillMatches": Array<{
    "skill": string,
    "matchType": "demonstrated" | "related" | "not-documented",
    "evidence": string (1 sentence citing specific portfolio evidence, or "Not found in documented profile" if not-documented)
  }>,
  "relevantProjects": Array<{
    "name": string,
    "relevance": string (1–2 sentences),
    "skills": string[]
  }>,
  "keyStrengths": string[] (4–6 bullet items, specific and evidence-based),
  "potentialGaps": string[] (max 3 items, constructive wording),
  "recruiterRecommendation": string (2–3 sentences, positive where supported),
  "followUpQuestions": string[] (exactly 4 questions a recruiter might ask),
  "scoringBreakdown": {
    "technicalSkills": { "score": number (0–40), "weight": 40, "maxScore": 40 },
    "projectExperience": { "score": number (0–25), "weight": 25, "maxScore": 25 },
    "responsibilities": { "score": number (0–15), "weight": 15, "maxScore": 15 },
    "preferredSkills": { "score": number (0–10), "weight": 10, "maxScore": 10 },
    "education": { "score": number (0–10), "weight": 10, "maxScore": 10 }
  }
}

Do not include any text before or after the JSON object.`;

  const userContent = `Here is Parth Patel's verified portfolio and resume evidence:
<portfolio_evidence>
${portfolioContext}
</portfolio_evidence>

Here is the Job Description to analyze:
<job_description>
${cleanJD}
</job_description>

Analyze the profile against the JD. Return ONLY the JSON object as instructed.`;

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.1,
    max_tokens: 3000,
    top_p: 0.95,
  });

  const rawText = completion.choices[0]?.message?.content || "";

  // Extract JSON from the response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI returned an invalid response format. Please try again.");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("AI returned malformed JSON. Please try again.");
  }

  // Validate and compute final match score from scoring breakdown
  const breakdown = parsed.scoringBreakdown;
  if (!breakdown) throw new Error("Missing scoring breakdown in AI response.");

  const totalScore =
    (breakdown.technicalSkills?.score || 0) +
    (breakdown.projectExperience?.score || 0) +
    (breakdown.responsibilities?.score || 0) +
    (breakdown.preferredSkills?.score || 0) +
    (breakdown.education?.score || 0);

  const matchScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  let matchCategory: JDAnalysisResult["matchCategory"];
  if (matchScore >= 80) matchCategory = "Strong Match";
  else if (matchScore >= 60) matchCategory = "Good Match";
  else if (matchScore >= 40) matchCategory = "Moderate Match";
  else matchCategory = "Limited Match";

  return {
    jobTitle: String(parsed.jobTitle || "Unknown Role").slice(0, 120),
    companyName: String(parsed.companyName || "Not specified").slice(0, 100),
    matchScore,
    matchCategory,
    summary: String(parsed.summary || "").slice(0, 600),
    skillMatches: Array.isArray(parsed.skillMatches)
      ? parsed.skillMatches.slice(0, 20).map((s: any) => ({
          skill: String(s.skill || "").slice(0, 80),
          matchType: ["demonstrated", "related", "not-documented"].includes(s.matchType)
            ? s.matchType
            : "not-documented",
          evidence: String(s.evidence || "").slice(0, 300),
        }))
      : [],
    relevantProjects: Array.isArray(parsed.relevantProjects)
      ? parsed.relevantProjects.slice(0, 5).map((p: any) => ({
          name: String(p.name || "").slice(0, 80),
          relevance: String(p.relevance || "").slice(0, 400),
          skills: Array.isArray(p.skills) ? p.skills.slice(0, 8).map(String) : [],
        }))
      : [],
    keyStrengths: Array.isArray(parsed.keyStrengths)
      ? parsed.keyStrengths.slice(0, 6).map((s: any) => String(s).slice(0, 200))
      : [],
    potentialGaps: Array.isArray(parsed.potentialGaps)
      ? parsed.potentialGaps.slice(0, 3).map((g: any) => String(g).slice(0, 200))
      : [],
    recruiterRecommendation: String(parsed.recruiterRecommendation || "").slice(0, 600),
    followUpQuestions: Array.isArray(parsed.followUpQuestions)
      ? parsed.followUpQuestions.slice(0, 4).map((q: any) => String(q).slice(0, 200))
      : [],
    scoringBreakdown: {
      technicalSkills: {
        score: Math.min(40, Math.max(0, breakdown.technicalSkills?.score || 0)),
        weight: 40,
        maxScore: 40,
      },
      projectExperience: {
        score: Math.min(25, Math.max(0, breakdown.projectExperience?.score || 0)),
        weight: 25,
        maxScore: 25,
      },
      responsibilities: {
        score: Math.min(15, Math.max(0, breakdown.responsibilities?.score || 0)),
        weight: 15,
        maxScore: 15,
      },
      preferredSkills: {
        score: Math.min(10, Math.max(0, breakdown.preferredSkills?.score || 0)),
        weight: 10,
        maxScore: 10,
      },
      education: {
        score: Math.min(10, Math.max(0, breakdown.education?.score || 0)),
        weight: 10,
        maxScore: 10,
      },
    },
  };
}


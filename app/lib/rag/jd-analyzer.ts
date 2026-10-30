import { Groq } from "groq-sdk";
import { retrieveRelevantChunks } from "./retriever";
import { getGroqApiKey } from "./groq-client";
import { validateJobDescriptionText } from "./jd-validator";
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
  return jd
    .replace(/ignore (previous|all|above|prior) (instructions?|prompts?|rules?)/gi, "[REDACTED]")
    .replace(/system\s*prompt/gi, "[REDACTED]")
    .replace(/you are now/gi, "[REDACTED]")
    .replace(/act as/gi, "[REDACTED]")
    .replace(/\[INST\]/gi, "[REDACTED]")
    .replace(/\[\/INST\]/gi, "[REDACTED]")
    .slice(0, 5000);
}

// ─── Portfolio knowledge retrieval for JD analysis ───────────────────────────

async function retrievePortfolioForJD(): Promise<string> {
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

  const sorted = Array.from(allChunks.values()).sort((a, b) => b.score - a.score);
  return sorted
    .slice(0, 18)
    .map(
      (r, i) =>
        `[Portfolio Chunk ${i + 1}] (${r.chunk.metadata.source.toUpperCase()} — ${r.chunk.metadata.section}):\n${r.chunk.content}`
    )
    .join("\n\n---\n\n");
}

// ─── Main analysis function ───────────────────────────────────────────────────

export async function analyzeJobDescription(rawJD: string): Promise<JDAnalysisResult> {
  // 1. Validate JD text
  const validation = validateJobDescriptionText(rawJD);
  if (!validation.isValid) {
    throw new Error(
      validation.reason ||
        "The provided text does not appear to describe a job opening or role requirements. Please paste a valid job description or upload a document."
    );
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });
  const configuredModel = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const candidateModels = [configuredModel, "qwen/qwen3.8-27b", "openai/gpt-oss-20b"].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  const cleanJD = sanitizeJD(rawJD);
  const portfolioContext = await retrievePortfolioForJD();

  const systemPrompt = `You are an expert technical recruiter and career advisor performing a rigorous, personalized job description fit analysis for candidate Parth Patel.

CORE INSTRUCTIONS & COMPARISON RULES:
1. VALIDATION GUARDRAIL:
   First, verify whether the provided text is genuinely describing a job position, internship, or technical role with duties or requirements.
   If the text is random characters, incoherent text, spam, or contains no identifiable technical/job requirements, return ONLY:
   {"isValidJD": false, "errorMessage": "The provided text does not appear to describe a legitimate job description or role requirements. Please provide a complete job description."}

2. DIRECT RELEVANCE TO THIS SPECIFIC JOB DESCRIPTION:
   - "jobTitle": Extract the specific title from the JD (e.g. "Full Stack Developer", "Backend Engineer", etc.). Never return "Not specified" if a title can be deduced.
   - "companyName": Company name in the JD, or "Not specified".
   - "summary": 2–3 personalized sentences directly comparing how Parth Patel's verified technical skills, internship at Shakktii AI (MockMingle), and full-stack projects directly address THIS specific role's challenges.
   - "skillMatches":
     * ONLY extract skills, technologies, and requirements EXPLICITLY requested or mentioned in the Job Description.
     * Do NOT invent or list unrelated skills from Parth's profile that the JD did not ask for.
     * Categorize each JD requirement as "demonstrated" (direct evidence in portfolio), "related" (transferable skill), or "not-documented" (not in profile).
   - "relevantProjects":
     * Select from Parth's documented projects (QuizLab, MockMingle at Shakktii AI, Hardware Shop POS) that directly map to the JD's requirements, clearly articulating why they match this JD.
   - "keyStrengths":
     * 4–5 bullet items showing how Parth's documented achievements directly satisfy the core needs of this specific JD.
   - "potentialGaps" (Role-Specific Considerations):
     * ONLY list skills or qualifications that the JOB DESCRIPTION explicitly demanded and that are absent from Parth's documented profile (e.g., "Docker", "Kubernetes", "AWS Lambda", "GraphQL").
     * ABSOLUTELY NEVER invent or print unsolicited assumptions or negative claims about Parth's projects (such as "POS is not publicly available" or "limited enterprise exposure"). Both QuizLab (deployed live on Vercel) and Hardware Shop POS (publicly released and downloadable on GitHub as a desktop app with Windows installer) are active, public projects.
     * If Parth meets all or nearly all requirements of the JD, return an empty array [] or at most 1 constructive note regarding role-specific domain knowledge.
   - "recruiterRecommendation":
     * 2–3 sentences of an objective, positive recruiter verdict highlighting why Parth should be interviewed for this specific role.

SCORING WEIGHTS (sum to 100):
- Required Technical Skills: 40 points max
- Projects & Practical Experience: 25 points max
- Job Responsibilities Alignment: 15 points max
- Preferred Skills: 10 points max
- Education & Qualifications: 10 points max

SCORE CATEGORIES:
- 80–100: Strong Match
- 60–79: Good Match
- 40–59: Moderate Match
- Below 40: Limited Match

RETURN ONLY A VALID JSON OBJECT matching this exact TypeScript structure:
{
  "isValidJD": true,
  "jobTitle": string,
  "companyName": string,
  "summary": string,
  "skillMatches": Array<{
    "skill": string,
    "matchType": "demonstrated" | "related" | "not-documented",
    "evidence": string
  }>,
  "relevantProjects": Array<{
    "name": string,
    "relevance": string,
    "skills": string[]
  }>,
  "keyStrengths": string[],
  "potentialGaps": string[],
  "recruiterRecommendation": string,
  "followUpQuestions": string[],
  "scoringBreakdown": {
    "technicalSkills": { "score": number, "weight": 40, "maxScore": 40 },
    "projectExperience": { "score": number, "weight": 25, "maxScore": 25 },
    "responsibilities": { "score": number, "weight": 15, "maxScore": 15 },
    "preferredSkills": { "score": number, "weight": 10, "maxScore": 10 },
    "education": { "score": number, "weight": 10, "maxScore": 10 }
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

Compare the candidate's verified profile against the JD requirements and return ONLY the JSON object.`;

  let completion: any = null;
  let lastError: any = null;

  for (const modelToTry of candidateModels) {
    try {
      completion = await groq.chat.completions.create({
        model: modelToTry,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.1,
        max_tokens: 3000,
        top_p: 0.95,
      });
      if (completion && completion.choices && completion.choices.length > 0) {
        break;
      }
    } catch (err: any) {
      console.warn(`[analyzeJobDescription] Model ${modelToTry} attempt failed, trying fallback:`, err?.message);
      lastError = err;
    }
  }

  if (!completion) {
    throw new Error(lastError?.message || "Failed to analyze the job description with AI.");
  }

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

  // Handle explicit validation failure from LLM
  if (parsed.isValidJD === false) {
    throw new Error(
      parsed.errorMessage ||
        "The provided text does not appear to describe a job opening. Please paste a valid job description or upload a document."
    );
  }

  // Validate and compute final match score from scoring breakdown
  const breakdown = parsed.scoringBreakdown || {};
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
    jobTitle: String(parsed.jobTitle || "Target Role").slice(0, 120),
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

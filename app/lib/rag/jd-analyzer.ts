import { Groq } from "groq-sdk";
import { LocalVectorStore } from "./local-vector-store";
import { getGroqApiKey } from "./groq-client";
import { validateJobDescriptionText } from "./jd-validator";

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

function retrievePortfolioForJD(): string {
  try {
    const records = LocalVectorStore.getAll();
    if (records && records.length > 0) {
      return records
        .map(
          (r, i) =>
            `[Portfolio Chunk ${i + 1}] (${r.metadata.source.toUpperCase()} — ${r.metadata.section}):\n${r.metadata.content}`
        )
        .join("\n\n---\n\n");
    }
  } catch (err) {
    console.warn("[retrievePortfolioForJD] LocalVectorStore read warning:", err);
  }
  return "";
}

// ─── Robust JSON Parser with Auto-Repair ───────────────────────────────────────

function robustJsonParse(rawText: string): any {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from AI.");
  }

  // 1. Strip markdown code fences if present
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }

  // 2. Remove thinking tags (e.g. <think>...</think>)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 3. Extract the JSON candidate between outermost braces
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1) {
    throw new Error("No JSON object found in AI response.");
  }

  let jsonCandidate =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned.slice(firstBrace);

  // Direct parse attempt
  try {
    return JSON.parse(jsonCandidate);
  } catch (err1) {
    // Attempt standard syntax repair:
    // a. Remove trailing commas before closing braces/brackets
    let repaired = jsonCandidate
      .replace(/,\s*([}\]])/g, "$1")
      // b. Clean control characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

    try {
      return JSON.parse(repaired);
    } catch (err2) {
      // c. Auto-balance truncated JSON (unclosed strings, brackets, braces)
      try {
        let fixed = repaired;
        const quoteCount = (fixed.match(/(?<!\\)"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          fixed += '"';
        }
        const openBrackets = (fixed.match(/\[/g) || []).length;
        const closeBrackets = (fixed.match(/\]/g) || []).length;
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixed += "]";
        }
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixed += "}";
        }
        return JSON.parse(fixed);
      } catch (err3) {
        throw new Error("AI returned malformed JSON. Please try again.");
      }
    }
  }
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
  const portfolioContext = retrievePortfolioForJD();

  const systemPrompt = `You are an expert technical recruiter and career advisor performing a rigorous, personalized job description fit analysis for candidate Parth Patel.

CORE INSTRUCTIONS & COMPARISON RULES:
1. VALIDATION GUARDRAIL:
   First, verify whether the provided text is genuinely describing a job position, internship, or technical role with duties or requirements.
   If the text is random characters, incoherent text, spam, or contains no identifiable technical/job requirements, return ONLY:
   {"isValidJD": false, "errorMessage": "The provided text does not appear to describe a legitimate job description or role requirements. Please provide a complete job description."}

2. DIRECT RELEVANCE TO THIS SPECIFIC JOB DESCRIPTION:
   - "jobTitle": Extract the specific title from the JD (e.g. "Full Stack Developer", "Backend Engineer", "Trainee - IT", etc.).
   - "companyName": Company name in the JD, or "Not specified".
   - "summary": 2–3 personalized sentences directly comparing how Parth Patel's verified technical skills, internship at Shakktii AI (MockMingle), and full-stack projects directly address THIS specific role's requirements.
   - "skillMatches":
     * Extract the top 6 to 10 prominent skills and technologies EXPLICITLY requested in the Job Description. Do not exceed 10 items.
     * Categorize each requirement as "demonstrated" (direct evidence in portfolio), "related" (transferable skill), or "not-documented" (not in profile).
   - "relevantProjects":
     * Select 2 to 3 projects from Parth's documented work (QuizLab, MockMingle at Shakktii AI, Hardware Shop POS) that best match this JD.
   - "keyStrengths":
     * 4–5 bullet items showing how Parth's documented achievements satisfy the core needs of this specific JD.
   - "potentialGaps" (Role-Specific Considerations):
     * ONLY list skills or qualifications that the JOB DESCRIPTION explicitly demanded and that are absent from Parth's documented profile (e.g., "Docker", "Kubernetes", "AWS").
     * ABSOLUTELY NEVER invent negative claims about Parth's projects. Both QuizLab (deployed live on Vercel) and Hardware Shop POS (publicly released and downloadable on GitHub as a desktop app) are active, public projects.
     * If Parth meets all or nearly all requirements, return an empty array [] or at most 1 constructive note.
   - "recruiterRecommendation": Always return an empty string "".

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

RETURN ONLY A VALID JSON OBJECT matching this exact structure:
{
  "isValidJD": true,
  "jobTitle": string,
  "companyName": string,
  "summary": string,
  "skillMatches": [
    {
      "skill": string,
      "matchType": "demonstrated" | "related" | "not-documented",
      "evidence": string
    }
  ],
  "relevantProjects": [
    {
      "name": string,
      "relevance": string,
      "skills": string[]
    }
  ],
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

  let parsed: any = null;
  let lastError: any = null;

  for (const modelToTry of candidateModels) {
    try {
      const completion = await groq.chat.completions.create({
        model: modelToTry,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.1,
        max_tokens: 3800,
        response_format: { type: "json_object" },
      });

      const rawText = completion.choices[0]?.message?.content || "";
      if (rawText) {
        parsed = robustJsonParse(rawText);
        if (parsed) {
          break; // successfully received and parsed JSON!
        }
      }
    } catch (err: any) {
      console.warn(`[analyzeJobDescription] Model ${modelToTry} attempt failed, trying fallback:`, err?.message);
      lastError = err;
    }
  }

  if (!parsed) {
    throw new Error(lastError?.message || "Failed to analyze the job description with AI.");
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

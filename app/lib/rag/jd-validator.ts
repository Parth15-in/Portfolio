export interface JDValidationResult {
  isValid: boolean;
  reason?: string;
}

const JOB_KEYWORDS = [
  // Roles & titles
  "developer", "engineer", "architect", "programmer", "coder", "lead", "intern", "internship",
  "consultant", "analyst", "specialist", "administrator", "manager", "designer", "scientist", "tester", "qa",
  // Technical concepts & domains
  "software", "web", "frontend", "backend", "fullstack", "full-stack", "mobile", "cloud", "devops",
  "database", "api", "apis", "rest", "graphql", "microservices", "architecture", "ui", "ux",
  // Common languages & stacks
  "javascript", "typescript", "react", "next.js", "nextjs", "node", "nodejs", "express", "python",
  "java", "c++", "c#", "golang", "go", "rust", "php", "ruby", "sql", "postgresql", "postgres",
  "mongodb", "prisma", "orm", "tailwind", "css", "html", "aws", "docker", "kubernetes", "git",
  // Standard JD sections & language
  "responsibilities", "responsibility", "requirements", "requirement", "qualifications", "qualification",
  "skills", "experience", "years", "education", "degree", "bachelor", "bachelors", "master", "b.tech", "be",
  "collaborate", "deliver", "build", "maintain", "design", "implement", "test", "deploy", "agile",
  "scrum", "team", "candidates", "applicant", "job", "position", "role", "company", "hiring", "apply",
  "proficient", "knowledge", "understanding", "opportunity", "work", "stack", "tools"
];

/**
 * Validates whether user-supplied input is a genuine job description rather than random characters,
 * chat messages, or gibberish.
 */
export function validateJobDescriptionText(text: string): JDValidationResult {
  if (!text || typeof text !== "string") {
    return {
      isValid: false,
      reason: "Please paste a job description or attach a valid document (PDF/DOCX).",
    };
  }

  const trimmed = text.trim();

  // 1. Minimum character length
  if (trimmed.length < 50) {
    return {
      isValid: false,
      reason: "The job description is too short. Please paste the full job description or attach a valid document (at least 50 characters).",
    };
  }

  // 2. Tokenize words
  const words = trimmed
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 0);

  if (words.length < 8) {
    return {
      isValid: false,
      reason: "The input has too few words. Please paste a complete job description with role details and technical requirements.",
    };
  }

  // 3. Gibberish / keyboard mash detection
  let gibberishWordCount = 0;
  for (const w of words) {
    // Word with 4+ chars and no vowels (excluding short common acronyms like 'sql', 'css', 'npm')
    if (w.length >= 4 && !/[aeiouy]/i.test(w)) {
      gibberishWordCount++;
    }
    // Long sequence of consonants (e.g. 'kdfvbkdvkjvnkj')
    if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(w)) {
      gibberishWordCount++;
    }
    // Single word abnormally long (> 30 characters)
    if (w.length > 30) {
      gibberishWordCount++;
    }
  }

  if (gibberishWordCount / words.length > 0.25) {
    return {
      isValid: false,
      reason: "The input contains unrecognized or random characters. Please paste a valid job description or attach a valid PDF / Word document.",
    };
  }

  // 4. Job-relevance check: must contain at least 2 common job/role/tech terms
  const lowerText = trimmed.toLowerCase();
  const matchedKeywords = JOB_KEYWORDS.filter(k => lowerText.includes(k));

  if (matchedKeywords.length < 2) {
    return {
      isValid: false,
      reason: "The provided text does not appear to describe a job opening, technical requirements, or role responsibilities. Please paste a valid job description or attach a PDF / Word document.",
    };
  }

  return { isValid: true };
}


import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { DocumentChunk, KnowledgeCategory } from "./types";
import { projects, skillCategories, achievements, highlights } from "../data";

function hashText(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

/**
 * Parses text from the local Resume PDF using pdf-parse.
 */
export async function parseResumePDF(): Promise<string> {
  const resumePaths = [
    path.join(process.cwd(), "public", "Parth_Patel_Resume.pdf"),
    path.join(process.cwd(), "public", "resume.pdf"),
  ];

  let targetPath = "";
  for (const p of resumePaths) {
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  if (!targetPath) {
    throw new Error(
      "Resume PDF not found in public directory (checked Parth_Patel_Resume.pdf and resume.pdf)"
    );
  }

  const buffer = fs.readFileSync(targetPath);

  try {
    // Direct require of pdf-parse/lib/pdf-parse.js avoids the root index.js debug test runner
    // @ts-ignore
    const pdfParser = require("pdf-parse/lib/pdf-parse.js");
    const data = await pdfParser(buffer);
    if (data && data.text && data.text.trim().length > 0) {
      return data.text;
    }
  } catch (err) {
    console.warn("[Extractor] Error running pdf-parse:", err);
  }

  // If PDF parsing encounters an issue, read as raw string or report clear error
  throw new Error("Unable to extract text from Resume PDF.");
}

/**
 * Extracts and prepares all document chunks from both the portfolio data and the resume PDF.
 */
export async function extractAllKnowledge(): Promise<DocumentChunk[]> {
  const chunks: DocumentChunk[] = [];
  const now = new Date().toISOString();

  // ─── 1. PORTFOLIO WEBSITE DATA ──────────────────────────────────────────

  // About & Bio
  const aboutText = `
Parth Patel is a Full Stack AI Engineer and Computer Engineering graduate from MIT World Peace University (MIT-WPU), Pune, India.
He has hands-on experience building scalable web applications, developing reliable backend systems, optimizing databases, and integrating AI into practical software products.
He completed a 6-month Full Stack Developer Internship at Shakktii AI (January 2026 – June 2026).
Parth is passionate about combining clean user interfaces, robust backend architectures, and AI solutions to solve real-world problems.
He is open to software engineering and full-stack AI engineer opportunities.
`.trim();

  chunks.push({
    id: "portfolio-about-bio",
    content: aboutText,
    contentHash: hashText(aboutText),
    metadata: {
      source: "portfolio",
      category: "about",
      section: "About Me",
      sourceFile: "app/components/AboutSection.tsx",
      updatedAt: now,
    },
  });

  // Education
  const educationText = `
Education for Parth Patel:
Degree: Bachelor of Technology (B.Tech) in Computer Engineering
Institution: MIT World Peace University (MIT-WPU), Pune, Maharashtra, India
Duration: August 2023 – July 2026 (Graduating Class of 2026)
Academic Performance: CGPA 7.12 / 10
Core Coursework: Data Structures & Algorithms, Database Management Systems (DBMS), Operating Systems, Computer Networks, Software Engineering, Object-Oriented Programming, AI & Machine Learning.
`.trim();

  chunks.push({
    id: "portfolio-education-mitwpu",
    content: educationText,
    contentHash: hashText(educationText),
    metadata: {
      source: "portfolio",
      category: "education",
      section: "Education",
      sourceFile: "app/components/EducationSection.tsx",
      updatedAt: now,
    },
  });

  // Highlights
  const highlightsText = `
Key Career Highlights for Parth Patel:
- 6 Months: Full Stack Developer Internship at Shakktii AI in Pune.
- 500+ Users: Reach of MockMingle, an AI-powered EdTech platform he contributed to.
- 15+ Modules: Scalable full-stack modules engineered across frontend and backend.
- 25% Faster: API response latency reduction achieved through backend and database optimization.
- 30% Reduced Debugging Time: Through Agile workflows, CI/CD pipelines, and GitHub collaboration.
`.trim();

  chunks.push({
    id: "portfolio-highlights-metrics",
    content: highlightsText,
    contentHash: hashText(highlightsText),
    metadata: {
      source: "portfolio",
      category: "highlights",
      section: "Highlights",
      sourceFile: "app/lib/data.ts",
      updatedAt: now,
    },
  });

  // Experience at Shakktii AI
  const experienceText = `
Professional Internship Experience:
Company: Shakktii AI (https://www.shakktii.in/)
Role: Full Stack Developer Intern
Duration: January 2026 – June 2026 (6 months)
Location: Pune, Maharashtra, India
Platform: MockMingle — AI-powered EdTech interview preparation platform serving over 500 users.

Detailed Contributions and Responsibilities:
1. Developed and enhanced application features using React.js and Next.js, significantly improving usability and frontend functionality.
2. Integrated AI capabilities and refined prompts using few-shot examples and rubric-based evaluation criteria (clarity, technical accuracy, confidence) to enhance the quality, relevance, and consistency of AI-generated interview questions and feedback.
3. Designed and maintained 10+ RESTful APIs for user authentication, interview session management, and core backend functionality.
4. Profiled slow API endpoints to identify redundant MongoDB queries and unnecessarily large response payloads. Query performance was improved through proper indexing, optimized database queries, and response payload pruning, reducing average API response latency by 25%.
5. Tested REST APIs, resolved complex application bugs, and collaborated in Agile workflows using GitHub Actions CI/CD pipelines (automated linting, type-checking, unit testing) and Postman API collections, reducing team debugging time by 30%.
6. Tech stack utilized during internship: React.js, Next.js, TypeScript, Node.js, MongoDB, REST APIs, OpenAI API, GitHub, CI/CD, Postman.
`.trim();

  chunks.push({
    id: "portfolio-experience-shakktii",
    content: experienceText,
    contentHash: hashText(experienceText),
    metadata: {
      source: "portfolio",
      category: "experience",
      section: "Experience - Shakktii AI",
      sourceFile: "app/components/ExperienceSection.tsx",
      url: "https://www.shakktii.in/",
      updatedAt: now,
    },
  });

  // Projects from data.ts
  for (const project of projects) {
    const isBackend = project.techStack.some(t => ["Node.js", "PostgreSQL", "Prisma ORM", "REST API", "NextAuth"].includes(t));
    const projectContent = `
Project: ${project.title} (${project.subtitle})
Type: ${project.organization ? `Professional Work (${project.organization})` : "Personal / Technical Project"}
Description: ${project.description}
Backend & Architecture: ${isBackend ? "Demonstrates full-stack and backend engineering, RESTful APIs, relational data modeling with PostgreSQL and Prisma ORM." : "Frontend and full-stack integration"}
Live URL: ${project.liveUrl || "Not publicly deployed (desktop application or internal)"}
GitHub Repository: ${project.githubUrl || "Private or internal repository"}
Tech Stack: ${project.techStack.join(", ")}
Key Features and Implementations:
${project.features.map(f => `- ${f}`).join("\n")}
`.trim();

    chunks.push({
      id: `portfolio-project-${project.id}`,
      content: projectContent,
      contentHash: hashText(projectContent),
      metadata: {
        source: "portfolio",
        category: "projects",
        section: `Project: ${project.title}`,
        projectName: project.title,
        sourceFile: "app/lib/data.ts",
        url: project.liveUrl,
        updatedAt: now,
      },
    });
  }

  // Technical Skills from data.ts
  for (const category of skillCategories) {
    const skillsContent = `
Technical Skills - ${category.category}:
Parth Patel is proficient in the following ${category.category.toLowerCase()} technologies and tools:
${category.skills.join(", ")}
`.trim();

    chunks.push({
      id: `portfolio-skills-${category.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      content: skillsContent,
      contentHash: hashText(skillsContent),
      metadata: {
        source: "portfolio",
        category: "skills",
        section: `Skills: ${category.category}`,
        sourceFile: "app/lib/data.ts",
        updatedAt: now,
      },
    });
  }

  // Consolidated Achievements Summary
  const allAchievementsSummary = `
Achievements, Honors, Patents, and Awards of Parth Patel:
1. Indian Patent: Published patent titled "A Method for Operating a Touchless Mouse Using Gesture Recognition to Enhance User Interaction and Improve Accessibility" in Computer Science. The system uses a wearable finger band equipped with a high-resolution motion sensor to capture hand and finger movements in 3D space, processed by an AI-driven gesture recognition algorithm that converts gestures into cursor movements and control commands. It adapts to user interaction patterns via machine learning, improving accessibility for people with mobility impairments. Report: /Indian_Patent_Report_Parth_Patel.pdf
2. Silver Medal at Visualathon: Awarded Silver Medal for redesigning the IRCTC train booking interface. The redesign focused on accessibility and simplifying the booking experience with color-coded train categories (Intercity, Superfast, Rajdhani Express), expanding abbreviations into full-form labels, a step-by-step booking process, live train tracking, one-tap payments, instant refunds, and multi-factor authentication. Certificate: /Silver_Medal_Certificate_Parth_Patel.pdf
3. RIDE Volunteer: Marketing Member at RIDE (Research, Innovation, Design, Entrepreneurship), supporting tech outreach and promotion.
`.trim();

  chunks.push({
    id: "portfolio-achievements-summary",
    content: allAchievementsSummary,
    contentHash: hashText(allAchievementsSummary),
    metadata: {
      source: "portfolio",
      category: "achievements",
      section: "Achievements & Honors Summary",
      sourceFile: "app/lib/data.ts",
      updatedAt: now,
    },
  });

  // Individual Achievements from data.ts
  for (const achievement of achievements) {
    const achievementContent = `
Achievement: ${achievement.title}
Type: ${achievement.type.toUpperCase()}
Description: ${achievement.description}
${achievement.downloadUrl ? `Download Document: ${achievement.downloadUrl} (${achievement.downloadLabel})` : ""}
`.trim();

    chunks.push({
      id: `portfolio-achievement-${achievement.id}`,
      content: achievementContent,
      contentHash: hashText(achievementContent),
      metadata: {
        source: "portfolio",
        category: "achievements",
        section: `Achievement: ${achievement.title}`,
        sourceFile: "app/lib/data.ts",
        url: achievement.downloadUrl,
        updatedAt: now,
      },
    });
  }

  // Contact Details
  const contactText = `
Contact Information and Public Profiles for Parth Patel:
- Name: Parth Patel
- Role: Full Stack AI Engineer
- Email: parthpatel15423@gmail.com
- Phone: +91 7776925200
- Location: Pune, Maharashtra, India
- GitHub: https://github.com/Parth15-in
- LinkedIn: https://www.linkedin.com/in/parthpatel15423/
- Instagram: https://www.instagram.com/parthpatel15423
- Portfolio Website: Local / Vercel deployed portfolio
- Resume: Downloadable from portfolio at /Parth_Patel_Resume.pdf
`.trim();

  chunks.push({
    id: "portfolio-contact-info",
    content: contactText,
    contentHash: hashText(contactText),
    metadata: {
      source: "portfolio",
      category: "contact",
      section: "Contact Information",
      sourceFile: "app/components/ContactSection.tsx",
      updatedAt: now,
    },
  });

  // ─── 2. VERIFIED TECHNICAL & RECRUITER Q&A ───────────────────────────────
  const verifiedQAs = [
    {
      id: "portfolio-qa-quizlab-groq-challenges",
      question: "What specific challenges did Parth encounter while integrating the GroqAI API, and how did he resolve them?",
      answer: "The main challenge was ensuring predictable, structured JSON outputs for quizzes with varying difficulty and question counts, as LLMs can sometimes return conversational filler. Parth solved this by implementing strict system prompts, JSON mode enforcement, and a Zod schema validation layer on the backend. Additionally, he handled Groq rate limits by caching frequently requested topic quizzes in PostgreSQL using Prisma ORM.",
      section: "QuizLab — GroqAI API Integration & Challenges",
      category: "projects" as KnowledgeCategory,
      projectName: "QuizLab",
    },
    {
      id: "portfolio-qa-quizlab-nextauth-flow",
      question: "Can you describe the authentication flow Parth implemented with NextAuth in QuizLab?",
      answer: "NextAuth was configured with Google OAuth to enable secure sign-in through Google accounts. It manages user authentication and sessions using secure HTTP-only cookies. The Prisma Adapter integrates with PostgreSQL to store user profiles and linked Google accounts, ensuring authenticated access to saved quiz history and progress tracking.",
      section: "QuizLab — NextAuth Authentication Flow",
      category: "projects" as KnowledgeCategory,
      projectName: "QuizLab",
    },
    {
      id: "portfolio-qa-quizlab-generation-validation",
      question: "How does QuizLab handle quiz generation and answer validation?",
      answer: "Quiz generation happens through a serverless API route that sends prompt-engineered requests to GroqAI. When a user submits their answers, validation is performed on the server side to calculate scores, check accuracy, and store the attempt history in PostgreSQL via Prisma.",
      section: "QuizLab — Quiz Generation & Answer Validation",
      category: "projects" as KnowledgeCategory,
      projectName: "QuizLab",
    },
    {
      id: "portfolio-qa-hardware-pos-electron-nextjs",
      question: "Why did Parth choose Electron with Next.js for the Hardware Shop POS desktop application?",
      answer: "Electron allowed packaging a desktop-grade offline-first experience with OS-level hardware access (such as receipt printers and local file exports for PDF and Excel reports), while Next.js and TypeScript provided modern component design, fast UI reactivity, and clean separation of business logic.",
      section: "Hardware Shop POS — Electron Architecture & Next.js",
      category: "projects" as KnowledgeCategory,
      projectName: "Hardware Shop POS",
    },
    {
      id: "portfolio-qa-hardware-pos-tier-pricing",
      question: "How does the multi-tier pricing system (Regular, Electrician, Plumber) work in the Hardware Shop POS database?",
      answer: "The PostgreSQL database schema models products with category-specific discount structures and tier-based price columns. During checkout, the customer's tier profile automatically applies the appropriate unit margin and tax calculations via Prisma queries, preventing manual cashier pricing errors.",
      section: "Hardware Shop POS — Multi-Tier Pricing Architecture",
      category: "projects" as KnowledgeCategory,
      projectName: "Hardware Shop POS",
    },
    {
      id: "portfolio-qa-hardware-pos-credit-management",
      question: "How did Parth handle credit management and partial payment tracking in Hardware Shop POS?",
      answer: "Each customer account has a ledger tracking outstanding balance, credit limit, and transaction history. Partial payments record payment events linked to invoices, using database transactions in Prisma to ensure atomic updates to customer debt and shop revenue records.",
      section: "Hardware Shop POS — Credit & Ledger Management",
      category: "projects" as KnowledgeCategory,
      projectName: "Hardware Shop POS",
    },
    {
      id: "portfolio-qa-shakktii-latency-reduction",
      question: "How did Parth achieve a 25% reduction in API response latency at Shakktii AI?",
      answer: "Slow API endpoints were profiled to identify redundant MongoDB queries and unnecessarily large response payloads. Query performance was improved through proper indexing, optimized database queries, and response payload pruning. These optimizations helped reduce average API response latency by 25%.",
      section: "Experience — Shakktii AI API Latency Reduction (25%)",
      category: "experience" as KnowledgeCategory,
      projectName: "MockMingle",
    },
    {
      id: "portfolio-qa-shakktii-prompt-engineering",
      question: "How did Parth refine AI prompts for MockMingle's interview feedback at Shakktii AI?",
      answer: "Early prompts produced generic advice. Parth introduced few-shot examples and rubric-based evaluation criteria (clarity, technical accuracy, confidence) in the prompt template, ensuring candidates received consistent, actionable, and structured interview feedback.",
      section: "Experience — Shakktii AI Prompt Engineering for MockMingle",
      category: "experience" as KnowledgeCategory,
      projectName: "MockMingle",
    },
    {
      id: "portfolio-qa-shakktii-cicd-workflow",
      question: "What did the team's CI/CD and debugging workflow look like to reduce debugging time by 30% at Shakktii AI?",
      answer: "Automated linting, type-checking, and unit testing were established using GitHub Actions before PR merges. Combined with Postman API collections and structured logging, bugs were caught in PR reviews rather than staging environments, cutting debugging cycles by 30%.",
      section: "Experience — Shakktii AI CI/CD & Debugging Workflow",
      category: "experience" as KnowledgeCategory,
      projectName: "MockMingle",
    },
    {
      id: "portfolio-qa-patent-touchless-mouse",
      question: "How does the touchless gesture recognition mouse patent work technically?",
      answer: "The system uses a wearable finger band equipped with a high-resolution motion sensor to capture hand and finger movements in three-dimensional space. The collected sensor data is processed by an AI-driven gesture recognition algorithm that identifies gestures and converts them into cursor movements and control commands. These commands are transmitted to digital systems to perform actions without physical contact with traditional input devices. The system can also adapt to individual interaction patterns using machine learning, improving accessibility, particularly for people with mobility impairments. Published Indian Patent titled 'A Method for Operating a Touchless Mouse Using Gesture Recognition to Enhance User Interaction and Improve Accessibility'.",
      section: "Achievements — Indian Patent: Touchless Mouse & Gesture Recognition",
      category: "achievements" as KnowledgeCategory,
    },
    {
      id: "portfolio-qa-visualathon-irctc-redesign",
      question: "What UX and accessibility improvements did Parth make in his IRCTC train booking redesign that won the Silver Medal at Visualathon?",
      answer: "The redesign focused on improving accessibility and simplifying the train booking experience. It introduced color-coded train categories, including Intercity, Superfast, and Rajdhani Express, making train types easier to identify. Other improvements included expanding abbreviations into full-form labels, providing a step-by-step booking process, and simplifying navigation for users of all age groups. The design also incorporated live train tracking, one-tap payments, instant refunds, and multi-factor authentication to make the booking experience more convenient, accessible, and secure. Awarded the Silver Medal at Visualathon.",
      section: "Achievements — Visualathon Silver Medal: IRCTC Redesign",
      category: "achievements" as KnowledgeCategory,
    },
  ];

  for (const qa of verifiedQAs) {
    const qaContent = `
Verified Topic & Engineering Details: ${qa.section}
Question: ${qa.question}
Answer: ${qa.answer}
`.trim();

    chunks.push({
      id: qa.id,
      content: qaContent,
      contentHash: hashText(qaContent),
      metadata: {
        source: "portfolio",
        category: qa.category,
        section: qa.section,
        projectName: qa.projectName,
        sourceFile: "app/lib/rag/extractor.ts",
        updatedAt: now,
      },
    });
  }

  // ─── 3. RESUME PDF DATA ──────────────────────────────────────────────────
  try {
    const resumeRawText = await parseResumePDF();

    // Chunk the parsed resume into meaningful semantic sections
    const resumeSections = extractResumeSections(resumeRawText);

    for (const sec of resumeSections) {
      chunks.push({
        id: `resume-${sec.category}-${sec.slug}`,
        content: `From Parth Patel's Resume:\nSection: ${sec.title}\n\n${sec.content}`,
        contentHash: hashText(sec.content),
        metadata: {
          source: "resume",
          category: sec.category,
          section: `Resume: ${sec.title}`,
          projectName: sec.projectName,
          sourceFile: "public/Parth_Patel_Resume.pdf",
          url: "/Parth_Patel_Resume.pdf",
          updatedAt: now,
        },
      });
    }
  } catch (err) {
    console.error("[Extractor] Warning: Could not parse resume PDF:", err);
  }

  return chunks;
}

interface ParsedResumeSection {
  title: string;
  slug: string;
  category: KnowledgeCategory;
  projectName?: string;
  content: string;
}

function extractResumeSections(rawText: string): ParsedResumeSection[] {
  const sections: ParsedResumeSection[] = [];

  // Normalize whitespace and line breaks
  const normalized = rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Profile Section
  const profileMatch = normalized.match(/PROFILE\n([\s\S]*?)(?=INTERNSHIP EXPERIENCE|EDUCATION|SKILLS|ACHIEVEMENTS|PROJECTS|$)/i);
  if (profileMatch && profileMatch[1].trim()) {
    sections.push({
      title: "Profile & Objective",
      slug: "profile",
      category: "about",
      content: profileMatch[1].trim(),
    });
  }

  // Internship Experience Section
  const experienceMatch = normalized.match(/INTERNSHIP EXPERIENCE\n([\s\S]*?)(?=EDUCATION|SKILLS|ACHIEVEMENTS|PROJECTS|$)/i);
  if (experienceMatch && experienceMatch[1].trim()) {
    sections.push({
      title: "Internship Experience (Shakktii AI)",
      slug: "shakktii-internship",
      category: "experience",
      content: experienceMatch[1].trim(),
    });
  }

  // Education Section
  const educationMatch = normalized.match(/EDUCATION\n([\s\S]*?)(?=SKILLS|ACHIEVEMENTS|PROJECTS|INTERNSHIP|$)/i);
  if (educationMatch && educationMatch[1].trim()) {
    sections.push({
      title: "Education (MIT-WPU Pune)",
      slug: "mit-wpu",
      category: "education",
      content: educationMatch[1].trim(),
    });
  }

  // Skills Section
  const skillsMatch = normalized.match(/SKILLS\n([\s\S]*?)(?=ACHIEVEMENTS|PROJECTS|EDUCATION|INTERNSHIP|$)/i);
  if (skillsMatch && skillsMatch[1].trim()) {
    sections.push({
      title: "Technical Skills Matrix",
      slug: "technical-skills",
      category: "skills",
      content: skillsMatch[1].trim(),
    });
  }

  // Achievements Section
  const achievementsMatch = normalized.match(/ACHIEVEMENTS\n([\s\S]*?)(?=PROJECTS|SKILLS|EDUCATION|INTERNSHIP|$)/i);
  if (achievementsMatch && achievementsMatch[1].trim()) {
    sections.push({
      title: "Achievements & Patents",
      slug: "achievements-patents",
      category: "achievements",
      content: achievementsMatch[1].trim(),
    });
  }

  // Projects Section
  const projectsMatch = normalized.match(/PROJECTS\n([\s\S]*?)(?=$)/i);
  if (projectsMatch && projectsMatch[1].trim()) {
    const projText = projectsMatch[1].trim();

    // Check for QuizLab project in resume
    if (projText.toLowerCase().includes("quiz")) {
      const quizMatch = projText.match(/AI Quiz Generation Website[\s\S]*?(?=Hardware Shop Management System|$)/i);
      if (quizMatch) {
        sections.push({
          title: "AI Quiz Generation Website (QuizLab)",
          slug: "quizlab-resume",
          category: "projects",
          projectName: "QuizLab",
          content: quizMatch[0].trim(),
        });
      }
    }

    // Check for Hardware Shop in resume
    if (projText.toLowerCase().includes("hardware shop")) {
      const hwMatch = projText.match(/Hardware Shop Management System[\s\S]*?(?=$)/i);
      if (hwMatch) {
        sections.push({
          title: "Hardware Shop Management System (POS)",
          slug: "hardware-shop-resume",
          category: "projects",
          projectName: "Hardware Shop POS",
          content: hwMatch[0].trim(),
        });
      }
    }
  }

  return sections;
}

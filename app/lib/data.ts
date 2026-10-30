// ─── Types ──────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface Highlight {
  value: string;
  label: string;
  context: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  techStack: string[];
  features: string[];
  liveUrl?: string;
  githubUrl?: string;
  desktopUrl?: string;
  organization?: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
}

export interface SkillCategory {
  category: string;
  icon: string;
  skills: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: "patent" | "award" | "volunteer";
  downloadUrl?: string;
  downloadLabel?: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

// ─── Highlights ──────────────────────────────────────────────────────────────

export const highlights: Highlight[] = [
  {
    value: "6",
    label: "Months",
    context: "Full Stack Developer Internship at Shakktii AI",
  },
  {
    value: "500+",
    label: "Users",
    context: "MockMingle Platform Reach",
  },
  {
    value: "15+",
    label: "Modules",
    context: "Full-Stack Modules Engineered",
  },
  {
    value: "25%",
    label: "Faster",
    context: "API Response Latency Reduction",
  },
];

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: "quizlab",
    title: "QuizLab",
    subtitle: "AI-Powered Quiz Generation Platform",
    description:
      "An AI-powered quiz generation platform that generates quizzes in real time using the GroqAI API and prompt engineering.",
    techStack: [
      "GroqAI",
      "TypeScript",
      "Next.js",
      "NextAuth",
      "Prisma ORM",
      "PostgreSQL",
      "Tailwind CSS",
      "Node.js",
    ],
    features: [
      "AI-powered real-time quiz generation via GroqAI & prompt engineering",
      "REST APIs for quiz generation and server-side answer validation",
      "Authentication using NextAuth with Google OAuth and HTTP-only cookies",
      "Database operations using Prisma ORM and PostgreSQL with response caching",
      "Responsive interface using Tailwind CSS and shadcn/ui",
      "Deployed on Vercel",
    ],
    liveUrl: "https://quizlab.vercel.app",
    gradientFrom: "#2563EB",
    gradientTo: "#6366F1",
    icon: "brain",
  },
  {
    id: "hardware-shop",
    title: "Hardware Shop POS",
    subtitle: "Full-Stack Desktop Point-of-Sale System",
    description:
      "A full-stack desktop point-of-sale application designed to manage inventory, billing, suppliers, and payments for a hardware shop.",
    techStack: [
      "Electron",
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Prisma ORM",
      "Recharts",
    ],
    features: [
      "Inventory and product management",
      "Billing and sales operations",
      "Supplier management system",
      "Multi-tier pricing: Regular, Electrician, and Plumber categories",
      "Credit management and partial payment tracking",
      "Reporting dashboard with Recharts visualizations",
      "PDF and Excel export support",
      "Relational database with optimized indexes",
    ],
    gradientFrom: "#0F766E",
    gradientTo: "#0369A1",
    icon: "store",
    desktopUrl: "https://github.com/Parth15-in/HardwarePRO#download-desktop-app-windows-exe",
  },
];

// ─── Skills ──────────────────────────────────────────────────────────────────

export const skillCategories: SkillCategory[] = [
  {
    category: "Programming Languages",
    icon: "code",
    skills: ["JavaScript", "TypeScript", "Python", "Java", "C", "C++"],
  },
  {
    category: "Frontend",
    icon: "layout",
    skills: ["React.js", "Next.js", "HTML", "CSS", "Tailwind CSS", "shadcn/ui"],
  },
  {
    category: "Backend",
    icon: "server",
    skills: ["Node.js", "Express.js", "REST API", "JWT", "bcrypt", "NextAuth"],
  },
  {
    category: "Databases",
    icon: "database",
    skills: ["MongoDB", "PostgreSQL", "MySQL", "Prisma ORM"],
  },
  {
    category: "AI & APIs",
    icon: "bot",
    skills: ["OpenAI API", "LangChain", "RAG Architecture", "Prompt Engineering", "GroqAI"],
  },
  {
    category: "Tools & DevOps",
    icon: "wrench",
    skills: ["Git", "GitHub", "Postman", "VS Code", "Firebase", "Vercel", "Render", "Docker", "Linux CLI", "CI/CD"],
  },
  {
    category: "Core Concepts",
    icon: "boxes",
    skills: ["Full Stack Development", "REST Architecture", "DBMS", "Agile Development", "Debugging"],
  },
];

// ─── Achievements ────────────────────────────────────────────────────────────

export const achievements: Achievement[] = [
  {
    id: "patent",
    title: "Indian Patent Holder",
    description:
      'Published patent titled "A Method for Operating a Touchless Mouse Using Gesture Recognition to Enhance User Interaction and Improve Accessibility" related to gesture recognition and touchless computer interaction.',
    type: "patent",
    downloadUrl: "/Indian_Patent_Report_Parth_Patel.pdf",
    downloadLabel: "Download Patent Report",
  },
  {
    id: "visualathon",
    title: "Silver Medal — Visualathon",
    description:
      "Secured a Silver Medal at Visualathon for redesigning the IRCTC interface, focusing on improved user experience, usability, and color-coded train categorization.",
    type: "award",
    downloadUrl: "/Silver_Medal_Certificate_Parth_Patel.pdf",
    downloadLabel: "Download Certificate",
  },
  {
    id: "ride",
    title: "Volunteer — RIDE",
    description:
      "Volunteered as a Marketing Member at RIDE (Research, Innovation, Design, Entrepreneurship), supporting outreach and promotional activities.",
    type: "volunteer",
  },
];

"use client";

import { motion } from "framer-motion";
import { ExternalLink, CheckCircle2, Building2, Brain, Store, Bot, Sparkles } from "lucide-react";
import { projects } from "@/app/lib/data";

const projectIconMap: Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>> = {
  brain: Brain,
  store: Store,
  bot: Bot,
};

function GithubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects" style={{ padding: "96px 0" }}>
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-3 mb-12"
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 3, borderRadius: 2, background: "var(--accent)" }} />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Projects
            </span>
          </div>
          <h2
            className="font-bold"
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              letterSpacing: "-0.03em",
              color: "var(--navy)",
            }}
          >
            Featured Projects
          </h2>
          <p className="text-base" style={{ color: "var(--muted)", maxWidth: 560 }}>
            A selection of projects that demonstrate my full-stack engineering and AI integration
            skills.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full" style={{ maxWidth: 840 }}>
            {projects.map((project, i) => {
              const ProjectIcon = projectIconMap[project.icon] || Sparkles;
              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col rounded-2xl overflow-hidden transition-shadow duration-300"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 32px rgba(0,0,0,0.12)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 2px 12px rgba(0,0,0,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                  }}
                >
                  {/* Card visual header */}
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{
                      background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientTo})`,
                      minHeight: 80,
                    }}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div
                        className="flex items-center justify-center rounded-xl"
                        style={{
                          width: 38,
                          height: 38,
                          background: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(6px)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                        }}
                      >
                        <ProjectIcon size={20} color="#fff" />
                      </div>
                      {project.organization && (
                        <span
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          <Building2 size={11} />
                          {project.organization}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            backdropFilter: "blur(4px)",
                          }}
                          aria-label={`View ${project.title} live demo`}
                        >
                          <ExternalLink size={11} />
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            backdropFilter: "blur(4px)",
                          }}
                          aria-label={`View ${project.title} on GitHub`}
                        >
                          <GithubIcon size={11} />
                          GitHub
                        </a>
                      )}
                      {project.desktopUrl && (
                        <a
                          href={project.desktopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            backdropFilter: "blur(4px)",
                          }}
                          aria-label={`Download ${project.title} desktop app`}
                        >
                          <ExternalLink size={11} />
                          Download
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="flex flex-col flex-1 p-5 gap-3.5">
                    {/* Title */}
                    <div>
                      <h3
                        className="font-bold text-base sm:text-lg"
                        style={{ color: "var(--navy)", letterSpacing: "-0.02em" }}
                      >
                        {project.title}
                      </h3>
                      <p className="text-xs font-medium mt-0.5" style={{ color: "var(--accent)" }}>
                        {project.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                      {project.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-col gap-1.5">
                      {project.features.slice(0, 4).map((f) => (
                        <div key={f} className="flex gap-2 items-start">
                          <CheckCircle2
                            size={13}
                            style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}
                          />
                          <span className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                          style={{
                            background: "var(--bg)",
                            color: "var(--muted)",
                            border: "1px solid var(--line)",
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90"
                          style={{
                            background: "var(--accent)",
                            color: "#fff",
                          }}
                        >
                          <ExternalLink size={12} />
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                          style={{
                            background: "var(--bg)",
                            color: "var(--navy)",
                            border: "1px solid var(--line)",
                          }}
                        >
                          <GithubIcon size={12} />
                          GitHub
                        </a>
                      )}
                      {!project.liveUrl && !project.githubUrl && !project.desktopUrl && (
                        <span
                          className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-medium"
                          style={{ background: "var(--bg)", color: "var(--muted)", border: "1px solid var(--line)" }}
                        >
                          {project.organization ? `Professional Work — ${project.organization}` : "Desktop Application"}
                        </span>
                      )}
                      {!project.liveUrl && !project.githubUrl && project.desktopUrl && (
                        <a
                          href={project.desktopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90"
                          style={{
                            background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientTo})`,
                            color: "#fff",
                          }}
                        >
                          <ExternalLink size={12} />
                          Desktop Application
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

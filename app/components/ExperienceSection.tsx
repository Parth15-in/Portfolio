"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, CheckCircle2, Zap, ExternalLink } from "lucide-react";

const techTags = ["React.js", "Next.js", "TypeScript", "Node.js", "REST APIs", "OpenAI", "GitHub", "CI/CD"];

const achievements = [
  "Developed and enhanced application features using React.js and Next.js, improving usability and frontend functionality.",
  "Integrated AI capabilities and refined prompts to improve the quality of AI-generated interview questions and responses.",
  "Tested REST APIs, debugged application issues, and collaborated with the team using GitHub and CI/CD workflows to streamline development and maintain application reliability.",
];

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      style={{
        padding: "96px 0",
        background: "var(--card)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-3 mb-12"
        >
          <div className="flex items-center gap-3">
            <div
              style={{ width: 36, height: 3, borderRadius: 2, background: "var(--accent)" }}
            />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Experience
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
            Professional Experience
          </h2>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full rounded-2xl p-6 md:p-8"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--line)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              {/* Company */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, var(--accent), var(--indigo))",
                  }}
                >
                  <Zap size={20} color="#fff" fill="rgba(255, 255, 255, 0.9)" />
                </div>
                <div>
                  <a
                    href="https://www.shakktii.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-lg inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 group"
                    style={{ color: "var(--navy)", letterSpacing: "-0.02em" }}
                    aria-label="Visit Shakktii AI website"
                  >
                    <span>Shakktii AI</span>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent)" }} />
                  </a>
                  <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                    Full Stack Developer Intern
                  </p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--muted)" }}>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                January 2026 – June 2026
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                Pune, India
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="mb-5 leading-relaxed" style={{ color: "var(--muted)" }}>
            Contributed to the development of{" "}
            <strong style={{ color: "var(--navy)", fontWeight: 600 }}>MockMingle</strong>, an
            AI-powered EdTech platform serving more than 500 users.
          </p>

          {/* Achievements */}
          <div className="flex flex-col gap-3 mb-6">
            {achievements.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-3"
              >
                <CheckCircle2
                  size={16}
                  style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}
                />
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {item}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid rgba(37,99,235,0.15)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

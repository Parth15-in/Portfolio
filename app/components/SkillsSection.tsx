"use client";

import { motion } from "framer-motion";
import { Code2, Layout, Server, Database, Bot, Wrench, Boxes, Cpu } from "lucide-react";
import { skillCategories } from "@/app/lib/data";

const skillIconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>> = {
  code: Code2,
  layout: Layout,
  server: Server,
  database: Database,
  bot: Bot,
  wrench: Wrench,
  boxes: Boxes,
};

export default function SkillsSection() {
  return (
    <section
      id="skills"
      style={{
        padding: "96px 0",
        background: "var(--card)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
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
              Skills
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
            Technical Skills
          </h2>
          <p className="text-base" style={{ color: "var(--muted)", maxWidth: 520 }}>
            Technologies and tools I work with across the full stack from frontend to backend,
            database design to AI integration.
          </p>
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {skillCategories.map((cat, i) => {
            const Icon = skillIconMap[cat.icon] || Cpu;
            return (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                className="p-5 rounded-2xl"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
              >
                {/* Category header */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: "var(--navy)" }}
                  >
                    {cat.category}
                  </h3>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-150"
                      style={{
                        background: "var(--card)",
                        color: "var(--muted)",
                        border: "1px solid var(--line)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)";
                        (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--card)";
                        (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

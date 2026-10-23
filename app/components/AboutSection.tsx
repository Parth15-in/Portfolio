"use client";

import { motion } from "framer-motion";
import { Code2, Bot, Cpu, Briefcase, GraduationCap, Sparkles, Milestone } from "lucide-react";

const quickPills = [
  { icon: Code2, text: "Full Stack Development" },
  { icon: Bot, text: "AI Integration" },
  { icon: Cpu, text: "Problem Solving" },
  { icon: Briefcase, text: "Open to Opportunities" },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      style={{
        padding: "96px 0",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 36,
                  height: 3,
                  borderRadius: 2,
                  background: "var(--accent)",
                }}
              />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                About Me
              </span>
            </div>

            <h2
              className="font-bold"
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                letterSpacing: "-0.03em",
                color: "var(--navy)",
                lineHeight: 1.2,
              }}
            >
              A little about me.
            </h2>

            <div className="flex flex-col gap-4" style={{ color: "var(--muted)", lineHeight: 1.75 }}>
              <p>
                I&apos;m a Computer Engineering graduate from{" "}
                <strong style={{ color: "var(--navy)", fontWeight: 600 }}>
                  MIT World Peace University, Pune
                </strong>
                , with hands-on experience in full-stack development and AI-powered application
                development.
              </p>
              <p>
                During my internship at{" "}
                <strong style={{ color: "var(--navy)", fontWeight: 600 }}>Shakktii AI</strong>, I
                contributed to an AI-powered EdTech platform, developed backend functionality, worked
                with REST APIs, and collaborated using GitHub and CI/CD workflows.
              </p>
              <p>
                I enjoy building practical applications that combine clean interfaces, reliable backend
                systems, and well-designed data models.
              </p>
            </div>

            {/* Quick info pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {quickPills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <span
                    key={pill.text}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium"
                    style={{
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      border: "1px solid rgba(37,99,235,0.15)",
                    }}
                  >
                    <Icon size={14} />
                    {pill.text}
                  </span>
                );
              })}
            </div>
          </motion.div>

          {/* Right: My Journey */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-6 sm:p-7 rounded-2xl flex flex-col gap-6 transition-all duration-300 hover:shadow-lg"
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 28,
                    height: 3,
                    borderRadius: 2,
                    background: "var(--accent)",
                  }}
                />
                <h3
                  className="font-bold tracking-widest text-xs uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  My Journey
                </h3>
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid rgba(37,99,235,0.15)",
                }}
              >
                <Milestone size={12} />
                Milestones
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="flex flex-col">
              {/* Step 1: 2026 Computer Engineering Graduate */}
              <div className="relative flex items-stretch gap-4 group">
                {/* Timeline Column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="z-10 flex items-center justify-center rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--card)",
                      border: "2px solid var(--accent)",
                    }}
                  >
                    <GraduationCap size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  {/* Connecting line to Step 2 */}
                  <div
                    className="w-[2px] flex-1 my-1.5 rounded-full"
                    style={{
                      background: "linear-gradient(to bottom, #2563EB, #3B82F6)",
                    }}
                    aria-hidden="true"
                  />
                </div>

                {/* Content Card */}
                <div className="flex-1 pb-4">
                  <div
                    className="p-3.5 sm:p-4 rounded-xl transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-sm"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                        }}
                      >
                        2026
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
                        B.Tech Degree
                      </span>
                    </div>
                    <h4
                      className="font-bold text-sm sm:text-base leading-snug"
                      style={{ color: "var(--navy)" }}
                    >
                      Computer Engineering Graduate
                    </h4>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      MIT World Peace University, Pune
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Full Stack Internship Shakktii AI */}
              <div className="relative flex items-stretch gap-4 group">
                {/* Timeline Column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="z-10 flex items-center justify-center rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--card)",
                      border: "2px solid var(--accent)",
                    }}
                  >
                    <Briefcase size={15} style={{ color: "var(--accent)" }} />
                  </div>
                  {/* Connecting line to Step 3 */}
                  <div
                    className="w-[2px] flex-1 my-1.5 rounded-full"
                    style={{
                      background: "linear-gradient(to bottom, #3B82F6, #10B981)",
                    }}
                    aria-hidden="true"
                  />
                </div>

                {/* Content Card */}
                <div className="flex-1 pb-4">
                  <div
                    className="p-3.5 sm:p-4 rounded-xl transition-all duration-200 group-hover:border-blue-300 group-hover:shadow-sm"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                        }}
                      >
                        Internship
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
                        Jan – Jun 2026
                      </span>
                    </div>
                    <h4
                      className="font-bold text-sm sm:text-base leading-snug"
                      style={{ color: "var(--navy)" }}
                    >
                      Full Stack Internship
                    </h4>
                    <p className="text-xs font-semibold mt-1" style={{ color: "var(--accent)" }}>
                      Shakktii AI
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      Contributed to AI-powered EdTech platform & backend REST APIs
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Current Focus Full Stack + AI */}
              <div className="relative flex items-start gap-4 group">
                {/* Timeline Column - No line below! */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="z-10 flex items-center justify-center rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--card)",
                      border: "2px solid #10B981",
                    }}
                  >
                    <Sparkles size={15} style={{ color: "#10B981" }} />
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1">
                  <div
                    className="p-3.5 sm:p-4 rounded-xl transition-all duration-200 group-hover:border-emerald-300 group-hover:shadow-sm"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        CURRENT FOCUS
                      </span>
                      <span className="text-[11px] font-medium text-emerald-600">
                        Present
                      </span>
                    </div>
                    <h4
                      className="font-bold text-sm sm:text-base leading-snug"
                      style={{ color: "var(--navy)" }}
                    >
                      Full Stack + AI
                    </h4>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      Building scalable web applications and AI-integrated systems
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

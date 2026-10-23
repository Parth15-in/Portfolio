"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Download } from "lucide-react";

function GithubIcon({ size = 22, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 22, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const techChips = [
  { label: "React.js", top: "-14px", left: "-12px", delay: "0s" },
  { label: "Next.js", top: "-14px", right: "-12px", delay: "0.3s" },
  { label: "PostgreSQL", top: "38%", right: "calc(100% + 14px)", delay: "1.2s" },
  { label: "TypeScript", top: "38%", left: "calc(100% + 14px)", delay: "0.8s" },
  { label: "JavaScript", bottom: "10px", right: "calc(100% + 10px)", delay: "0.9s" },
  { label: "Node.js", bottom: "10px", left: "calc(100% + 10px)", delay: "0.6s" },
  { label: "Java", isCentered: true, delay: "1.4s" },
];

export default function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 58;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ paddingTop: 112, paddingBottom: 32 }}
    >
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.06) 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
        aria-hidden="true"
      />
      {/* Top-right gradient blob */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: 550,
          height: 550,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          transform: "translate(25%, -25%)",
        }}
        aria-hidden="true"
      />

      {/* Container matching About Me layout (maxWidth: 1200, px-6) */}
      <div
        className="mx-auto w-full px-6 flex flex-col flex-1"
        style={{ maxWidth: 1200 }}
      >
        {/* Centered title below navbar */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="w-full text-center pt-1 pb-3 sm:pb-5"
        >
          <h2
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold tracking-[0.18em] uppercase text-black"
            style={{ fontFamily: "var(--font-heading), 'Space Grotesk', sans-serif" }}
          >
            FULL STACK AI ENGINEER
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center my-auto py-2 lg:py-6">
          {/* ── LEFT: Profile Picture Visual ─────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            }}
            className="relative flex items-center justify-center order-1"
            style={{ minHeight: 390 }}
          >
            {/* Ambient background glow */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 390,
                height: 390,
                background:
                  "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(99,102,241,0.1) 45%, transparent 70%)",
                filter: "blur(24px)",
              }}
              aria-hidden="true"
            />

            {/* Subtle outer pulsing ring */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 360,
                height: 360,
                border: "1px solid rgba(37,99,235,0.12)",
                animation: "pulse-ring 3.5s ease-out infinite",
              }}
              aria-hidden="true"
            />

            {/* Subtle inner decorative ring */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 320,
                height: 320,
                border: "1px dashed rgba(37,99,235,0.18)",
              }}
              aria-hidden="true"
            />

            {/* Round Profile Photo Card */}
            <div className="relative">
              <div
                className="relative rounded-full p-2"
                style={{
                  width: 290,
                  maxWidth: "80vw",
                  height: 290,
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(239,246,255,0.9))",
                  boxShadow:
                    "0 18px 45px -8px rgba(37,99,235,0.22), 0 0 0 2px rgba(37,99,235,0.14), 0 4px 14px rgba(0,0,0,0.04)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-white border border-slate-100 shadow-inner">
                  <Image
                    src="/parth-profile.jpg"
                    alt="Parth Patel - Full Stack AI Engineer"
                    fill
                    priority
                    sizes="(max-width: 768px) 80vw, 290px"
                    className="object-cover object-top transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Floating tech chips */}
              {techChips.map((chip) => {
                if (chip.isCentered) {
                  return (
                    <div
                      key={chip.label}
                      className="absolute left-1/2 -translate-x-1/2 hidden sm:flex z-10"
                      style={{ bottom: "-40px" }}
                    >
                      <div
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-md"
                        style={{
                          background: "var(--card)",
                          color: "var(--navy)",
                          border: "1px solid var(--line)",
                          animation: `float-y 3s ease-in-out infinite`,
                          animationDelay: chip.delay,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "var(--accent)",
                            display: "inline-block",
                          }}
                        />
                        {chip.label}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={chip.label}
                    className="absolute hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-md z-10"
                    style={{
                      top: chip.top,
                      left: "left" in chip ? chip.left : undefined,
                      right: "right" in chip ? chip.right : undefined,
                      bottom: "bottom" in chip ? chip.bottom : undefined,
                      background: "var(--card)",
                      color: "var(--navy)",
                      border: "1px solid var(--line)",
                      animation: `float-y 3s ease-in-out infinite`,
                      animationDelay: chip.delay,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        display: "inline-block",
                      }}
                    />
                    {chip.label}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── RIGHT: Text (Intro / About) ────────────────── */}
          <div className="flex flex-col gap-5 order-2">
            {/* Name label */}
            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-900"
            >
              Hello, I&apos;m Parth Patel
            </motion.p>

            {/* Main Heading */}
            <motion.h1
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="font-bold leading-tight"
              style={{
                fontSize: "clamp(1.85rem, 3.4vw, 2.65rem)",
                color: "var(--navy)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              I integrate{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, var(--accent), var(--indigo))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AI
              </span>{" "}
              into software to solve{" "}
              <span style={{ color: "var(--accent)" }}>real-world</span>{" "}
              problems
            </motion.h1>

            {/* Supporting paragraph */}
            <motion.p
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-base leading-relaxed text-slate-600"
              style={{ maxWidth: 520 }}
            >
              I&apos;m a Full Stack AI Engineer who enjoys building scalable web
              applications, developing reliable backend systems, and integrating AI
              into practical software products.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-wrap gap-3 pt-1"
            >
              <button
                onClick={() => scrollTo("projects")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
                }}
              >
                Explore My Projects
                <ArrowRight size={15} />
              </button>
              <a
                href="/Parth_Patel_Resume.pdf"
                download="Parth_Patel_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "var(--card)",
                  color: "var(--navy)",
                  border: "1.5px solid var(--line)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
                aria-label="Download Parth Patel's Resume"
              >
                <Download size={15} />
                Download Resume
              </a>
            </motion.div>

            {/* Social Links */}
            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex items-center gap-5 pt-2"
            >
              <a
                href="https://github.com/Parth15-in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-slate-800 transition-all duration-200 hover:text-blue-600 hover:-translate-y-0.5"
                aria-label="GitHub profile"
              >
                <GithubIcon size={19} strokeWidth={2.4} />
                <span>GitHub</span>
              </a>
              <span className="text-slate-300 font-bold select-none text-sm">|</span>
              <a
                href="https://www.linkedin.com/in/parthpatel15423/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-slate-800 transition-all duration-200 hover:text-blue-600 hover:-translate-y-0.5"
                aria-label="LinkedIn profile"
              >
                <LinkedinIcon size={19} strokeWidth={2.4} />
                <span>LinkedIn</span>
              </a>
              <span className="text-slate-300 font-bold select-none text-sm">|</span>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=parthpatel15423@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-slate-800 transition-all duration-200 hover:text-blue-600 hover:-translate-y-0.5"
                aria-label="Send email"
              >
                <Mail size={19} strokeWidth={2.4} />
                <span>Email</span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

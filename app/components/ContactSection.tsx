"use client";

import { motion } from "framer-motion";
import { Mail, ExternalLink } from "lucide-react";

function GithubIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function PhoneIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function ContactSection() {
  return (
    <section
      id="contact"
      style={{
        padding: "96px 0",
        background: "var(--bg)",
        minHeight: "calc(100vh - 58px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div className="mx-auto px-6 w-full" style={{ maxWidth: 1200 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Heading + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <div style={{ width: 36, height: 3, borderRadius: 2, background: "var(--accent)" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Contact
              </span>
            </div>

            <h2
              className="font-bold"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                letterSpacing: "-0.03em",
                color: "var(--navy)",
                lineHeight: 1.2,
              }}
            >
              Let&apos;s build something{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, var(--accent), var(--indigo))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                meaningful.
              </span>
            </h2>

            <p className="text-base leading-relaxed" style={{ color: "var(--muted)", maxWidth: 460 }}>
              I&apos;m interested in software engineering opportunities where I can contribute to
              real-world products, build reliable applications, and explore practical AI solutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=parthpatel15423@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.3)",
                }}
                aria-label="Send email to Parth Patel"
              >
                <Mail size={15} />
                Send Me an Email
              </a>
            </div>
          </motion.div>

          {/* Right: Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            {[
              {
                icon: <PhoneIcon size={18} style={{ color: "var(--accent)" }} />,
                label: "Phone",
                value: "+91 7776925200",
                href: "tel:+917776925200",
              },
              {
                icon: <InstagramIcon size={18} style={{ color: "#E1306C" }} />,
                label: "Instagram",
                value: "parthpatel15423",
                href: "https://www.instagram.com/parthpatel15423",
              },
              {
                icon: <LinkedinIcon size={18} style={{ color: "#0A66C2" }} />,
                label: "LinkedIn",
                value: "linkedin.com/in/parthpatel15423",
                href: "https://www.linkedin.com/in/parthpatel15423/",
              },
              {
                icon: <GithubIcon size={18} style={{ color: "var(--navy)" }} />,
                label: "GitHub",
                value: "github.com/Parth15-in",
                href: "https://github.com/Parth15-in",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    background: "var(--accent-soft)",
                  }}
                >
                  {item.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                    {item.label}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm font-medium truncate transition-colors hover:opacity-70 flex items-center gap-1"
                      style={{ color: "var(--navy)" }}
                    >
                      {item.value}
                      {item.href.startsWith("http") && <ExternalLink size={11} />}
                    </a>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

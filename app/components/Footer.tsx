"use client";

import { useState, useEffect } from "react";
import { Mail, ArrowUp } from "lucide-react";

function GithubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const scrollToTop = () => {
    if ((window as any).__lenis) {
      (window as any).__lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const [year, setYear] = useState<number | null>(null);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  return (
    <footer
      style={{
        borderTop: "1px solid var(--line)",
        background: "var(--card)",
      }}
    >
      <div
        className="mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ maxWidth: 1200 }}
      >
        {/* Left */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span
            className="font-bold"
            style={{ color: "var(--navy)", letterSpacing: "-0.02em" }}
          >
            PARTH<span style={{ color: "var(--accent)" }}>.</span>
          </span>
          <span
            className="text-sm hidden sm:inline"
            style={{ color: "var(--line)" }}
          >
            —
          </span>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Designed and built with care · © {year}
          </span>
        </div>

        {/* Center: Social links */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Parth15-in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110"
            style={{
              width: 36,
              height: 36,
              background: "var(--bg)",
              border: "1px solid var(--line)",
              color: "var(--muted)",
            }}
            aria-label="GitHub"
          >
            <GithubIcon size={15} />
          </a>
          <a
            href="https://www.linkedin.com/in/parthpatel15423/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110"
            style={{
              width: 36,
              height: 36,
              background: "var(--bg)",
              border: "1px solid var(--line)",
              color: "var(--muted)",
            }}
            aria-label="LinkedIn"
          >
            <LinkedinIcon size={15} />
          </a>
          <a
            href="https://www.instagram.com/parthpatel15423"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110"
            style={{
              width: 36,
              height: 36,
              background: "var(--bg)",
              border: "1px solid var(--line)",
              color: "var(--muted)",
            }}
            aria-label="Instagram"
          >
            <InstagramIcon size={15} />
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=parthpatel15423@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110"
            style={{
              width: 36,
              height: 36,
              background: "var(--bg)",
              border: "1px solid var(--line)",
              color: "var(--muted)",
            }}
            aria-label="Email"
          >
            <Mail size={15} />
          </a>
        </div>

        {/* Back to top */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent)",
            border: "1px solid rgba(37,99,235,0.15)",
          }}
          aria-label="Back to top"
        >
          <ArrowUp size={13} />
          Back to top
        </button>
      </div>
    </footer>
  );
}

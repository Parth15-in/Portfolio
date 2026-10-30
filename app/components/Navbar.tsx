"use client";

import { useEffect, useState, useCallback } from "react";
import { Menu, X, Download } from "lucide-react";
import { navLinks } from "@/app/lib/data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const updateScroll = () => {
      const scrollY = window.scrollY;
      const isScrolled = scrollY > 20;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));

      const isAtBottom =
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 70;

      if (isAtBottom) {
        setActiveSection((prev) => (prev !== "contact" ? "contact" : prev));
        rafId = null;
        return;
      }

      const sections = navLinks.map((l) => l.href.replace("#", ""));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - 120;
          if (scrollY >= top) {
            setActiveSection((prev) => (prev !== id ? id : prev));
            break;
          }
        }
      }
      rafId = null;
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const id = href.replace("#", "");
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      if ((window as any).__lenis) {
        (window as any).__lenis.scrollTo(el, { offset: -58 });
      } else {
        const offset = 58;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "none",
        transform: "translateZ(0)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-center px-4"
        style={{ height: 58 }}
      >
        {/* Centered Desktop Nav Menu */}
        <nav
          className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            boxShadow: "0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          }}
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3 py-1.5 rounded-full font-medium transition-all duration-200"
                style={{
                  fontSize: "13.5px",
                  color: isActive ? "var(--accent)" : "var(--navy)",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </button>
            );
          })}

          <div
            style={{
              width: 1,
              height: 16,
              background: "var(--line)",
              margin: "0 2px",
            }}
          />

          <a
            href="/Parth_Patel_Resume.pdf"
            download="Parth_Patel_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              fontSize: "13px",
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
            }}
          >
            <Download size={13} />
            Resume
          </a>
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center justify-end w-full px-4">
          <button
            className="p-2 rounded-xl transition-colors bg-white/90 border border-slate-200 shadow-sm"
            style={{ color: "var(--navy)" }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-5 pt-2 flex flex-col gap-1"
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--line)",
          }}
        >
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "var(--accent)" : "var(--navy)",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                }}
              >
                {link.label}
              </button>
            );
          })}
          <a
            href="/Parth_Patel_Resume.pdf"
            download="Parth_Patel_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold mt-1"
            style={{ background: "var(--accent)", color: "#fff" }}
            onClick={() => setMenuOpen(false)}
          >
            <Download size={14} />
            Download Resume
          </a>
        </div>
      )}
    </header>
  );
}

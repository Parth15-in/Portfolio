"use client";

import { motion } from "framer-motion";
import { GraduationCap, MapPin, Calendar, Award } from "lucide-react";

export default function EducationSection() {
  return (
    <section
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
              Education
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
            Education
          </h2>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-start gap-6 p-6 md:p-8 rounded-2xl"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--line)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            maxWidth: 700,
          }}
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, var(--accent), var(--indigo))",
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
            }}
          >
            <GraduationCap size={30} color="#fff" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 flex-1">
            <div>
              <h3
                className="font-bold text-lg"
                style={{ color: "var(--navy)", letterSpacing: "-0.02em" }}
              >
                MIT World Peace University
              </h3>
              <p
                className="font-semibold text-sm mt-0.5"
                style={{ color: "var(--accent)" }}
              >
                Bachelor of Technology (B.Tech) — Computer Engineering
              </p>
            </div>

            <div
              className="flex flex-wrap gap-4 text-sm"
              style={{ color: "var(--muted)" }}
            >
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                August 2023 – July 2026
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                Pune, India
              </span>
            </div>

            {/* CGPA badge */}
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid rgba(37,99,235,0.15)",
                }}
              >
                <Award size={15} />
                CGPA: 7.12 / 10
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { highlights } from "@/app/lib/data";

export default function HighlightsSection() {
  return (
    <section
      style={{
        background: "var(--card)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="mx-auto px-6 py-12" style={{ maxWidth: 1200 }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {highlights.map((h, i) => (
            <motion.div
              key={h.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="flex flex-col gap-1 text-center lg:text-left"
            >
              <div
                className="text-4xl font-bold tracking-tight"
                style={{
                  color: "var(--accent)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {h.value}
                <span
                  className="text-2xl ml-1"
                  style={{ color: "var(--muted)", fontWeight: 500 }}
                >
                  {h.label}
                </span>
              </div>
              <p
                className="text-sm leading-snug"
                style={{ color: "var(--muted)" }}
              >
                {h.context}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

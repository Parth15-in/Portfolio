"use client";

import { motion } from "framer-motion";
import { FileText, Medal, Handshake, Download } from "lucide-react";
import { achievements } from "@/app/lib/data";

const iconMap = {
  patent: FileText,
  award: Medal,
  volunteer: Handshake,
};

const colorMap = {
  patent: { bg: "#EEF2FF", icon: "#6366F1", border: "rgba(99,102,241,0.15)" },
  award: { bg: "#FEF9C3", icon: "#CA8A04", border: "rgba(202,138,4,0.2)" },
  volunteer: { bg: "#ECFDF5", icon: "#059669", border: "rgba(5,150,105,0.18)" },
};

export default function AchievementsSection() {
  return (
    <section id="achievements" style={{ padding: "96px 0" }}>
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
              Achievements
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
            Recognition & Achievements
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {achievements.map((item, i) => {
            const Icon = iconMap[item.type];
            const colors = colorMap[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
                className="flex flex-col gap-4 p-6 rounded-2xl"
                style={{
                  background: "var(--card)",
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Icon */}
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: 48,
                    height: 48,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} style={{ color: colors.icon }} />
                </div>

                {/* Title */}
                <h3
                  className="font-bold"
                  style={{
                    color: "var(--navy)",
                    fontSize: 15,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: "var(--muted)" }}
                >
                  {item.description}
                </p>

                {/* Type badge */}
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span
                    className="self-start text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                    style={{
                      background: colors.bg,
                      color: colors.icon,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {item.type === "volunteer" ? "Volunteer" : item.type === "award" ? "Award" : "Patent"}
                  </span>
                </div>

                {/* Download Button */}
                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    download={item.downloadUrl.split("/").pop()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 active:scale-95"
                    style={{
                      background: colors.bg,
                      color: colors.icon,
                      border: `1.5px solid ${colors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = colors.icon;
                      el.style.color = "#fff";
                      el.style.borderColor = colors.icon;
                      el.style.boxShadow = `0 4px 14px ${colors.border}`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = colors.bg;
                      el.style.color = colors.icon;
                      el.style.borderColor = colors.border;
                      el.style.boxShadow = "none";
                    }}
                    aria-label={item.downloadLabel || "Download"}
                  >
                    <Download size={13} />
                    {item.downloadLabel || "Download"}
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

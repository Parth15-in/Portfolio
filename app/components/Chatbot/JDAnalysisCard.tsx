"use client";

import React from "react";
import {
  CheckCircle2,
  Minus,
  XCircle,
  Code2,
  FolderGit2,
  Zap,
  AlertTriangle,
  Info,
  Star,
} from "lucide-react";
import type { JDAnalysisResult } from "@/app/lib/rag/jd-analyzer";

interface JDAnalysisCardProps {
  analysis: JDAnalysisResult;
  onAnalyzeAnother: () => void;
}

function MatchBadge({ type }: { type: "demonstrated" | "related" | "not-documented" }) {
  if (type === "demonstrated") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
        <CheckCircle2 size={9} />
        Demonstrated
      </span>
    );
  }
  if (type === "related") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
        <Minus size={9} />
        Related
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0">
      <XCircle size={9} />
      Not Documented
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const color =
    score >= 80
      ? "#10b981"
      : score >= 60
      ? "#3b82f6"
      : score >= 40
      ? "#f59e0b"
      : "#ef4444";

  const label =
    score >= 80
      ? "Strong Match"
      : score >= 60
      ? "Good Match"
      : score >= 40
      ? "Moderate Match"
      : "Limited Match";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[15px] font-bold text-slate-900">{score}%</span>
        </div>
      </div>
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: color + "18",
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  max,
}: {
  label: string;
  score: number;
  max: number;
}) {
  const pct = Math.round((score / max) * 100);
  const color =
    pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : pct >= 25 ? "bg-amber-500" : "bg-rose-400";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-[10.5px] font-medium text-slate-600">{label}</span>
        <span className="text-[10px] text-slate-500 font-mono">
          {score}/{max}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export const JDAnalysisCard: React.FC<JDAnalysisCardProps> = ({
  analysis,
  onAnalyzeAnother,
}) => {
  const demonstratedCount = analysis.skillMatches.filter(
    s => s.matchType === "demonstrated"
  ).length;
  const relatedCount = analysis.skillMatches.filter(s => s.matchType === "related").length;

  return (
    <div className="flex flex-col gap-3 w-full text-[12.5px]">
      {/* ── Section 1: Overall Match ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                JD Analysis
              </span>
              <h3 className="font-bold text-slate-900 text-[14px] leading-tight line-clamp-2">
                {analysis.jobTitle}
              </h3>
              {analysis.companyName !== "Not specified" && (
                <span className="text-[11px] text-slate-500 font-medium">
                  {analysis.companyName}
                </span>
              )}
            </div>
            <ScoreRing score={analysis.matchScore} />
          </div>
        </div>

        {/* Summary */}
        <div className="px-4 py-3">
          <p className="text-[12px] text-slate-700 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          {[
            { label: "Demonstrated", value: demonstratedCount, color: "text-emerald-600" },
            { label: "Related", value: relatedCount, color: "text-blue-600" },
            {
              label: "Not Documented",
              value: analysis.skillMatches.length - demonstratedCount - relatedCount,
              color: "text-slate-400",
            },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center py-2.5 px-1">
              <span className={`text-base font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-[9.5px] text-slate-400 font-medium text-center leading-tight mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Score Breakdown ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <Star size={12} className="text-amber-500" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Score Breakdown
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          <ScoreBar
            label="Required Technical Skills"
            score={analysis.scoringBreakdown.technicalSkills.score}
            max={40}
          />
          <ScoreBar
            label="Projects & Experience"
            score={analysis.scoringBreakdown.projectExperience.score}
            max={25}
          />
          <ScoreBar
            label="Responsibilities Alignment"
            score={analysis.scoringBreakdown.responsibilities.score}
            max={15}
          />
          <ScoreBar
            label="Preferred Skills"
            score={analysis.scoringBreakdown.preferredSkills.score}
            max={10}
          />
          <ScoreBar
            label="Education & Qualifications"
            score={analysis.scoringBreakdown.education.score}
            max={10}
          />
        </div>
      </div>

      {/* ── Section 3: Skills Match ── */}
      {analysis.skillMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={12} className="text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Skills Match
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {analysis.skillMatches.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 py-2 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 text-[12px]">{s.skill}</span>
                  <MatchBadge type={s.matchType} />
                </div>
                {s.matchType !== "not-documented" && (
                  <p className="text-[11px] text-slate-500 leading-snug">{s.evidence}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 4: Relevant Projects ── */}
      {analysis.relevantProjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <FolderGit2 size={12} className="text-indigo-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Relevant Projects
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {analysis.relevantProjects.map((p, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="font-bold text-slate-900 text-[12.5px]">{p.name}</span>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">{p.relevance}</p>
                {p.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.skills.map((skill, si) => (
                      <span
                        key={si}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 5: Key Strengths ── */}
      {analysis.keyStrengths.length > 0 && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={12} className="text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Key Strengths
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {analysis.keyStrengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-[12px] text-slate-700 leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ── Section 6: Role Requirements to Verify ── */}
      {analysis.potentialGaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={12} className="text-slate-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Role Requirements to Verify (JD-Specific)
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {analysis.potentialGaps.map((g, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5 text-xs flex-shrink-0">•</span>
                <span className="text-[12px] text-slate-700 leading-snug">{g}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Analyze Another JD ── */}
      <button
        onClick={onAnalyzeAnother}
        className="w-full text-center text-[11.5px] font-semibold py-2.5 rounded-xl border border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-100/60 transition-colors cursor-pointer"
      >
        + Analyze Another Job Description
      </button>
    </div>
  );
};


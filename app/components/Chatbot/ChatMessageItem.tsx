"use client";

import React from "react";
import { Bot, User, FileText, ExternalLink } from "lucide-react";
import type { SourceReference } from "@/app/lib/rag/types";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceReference[];
  suggestedQuestions?: string[];
  timestamp: string;
}

interface ChatMessageItemProps {
  message: Message;
  onSelectSuggestion?: (question: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSelectSuggestion,
}) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 text-sm ${isUser ? "flex-row-reverse" : "flex-row"}`}
      role="article"
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser
            ? "bg-slate-800 text-white"
            : "bg-blue-50 text-blue-600 border border-blue-100"
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={13} /> : <Bot size={15} />}
      </div>

      {/* Message content */}
      <div
        className={`flex flex-col gap-2 max-w-[85%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-slate-900 text-white rounded-tr-sm shadow-xs"
              : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm shadow-xs"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <FormattedMarkdown content={message.content} />
          )}
        </div>

        {/* Source Badges */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
            <span className="text-[11px] font-medium text-slate-400 self-center mr-1">
              Sources:
            </span>
            {message.sources.map((src, i) => (
              <a
                key={i}
                href={src.url || "#"}
                target={src.url ? "_blank" : undefined}
                rel={src.url ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title={`${src.source} — ${src.title}`}
              >
                <FileText size={10} className="text-slate-400" />
                <span className="max-w-[140px] truncate">{src.title}</span>
                {src.url && <ExternalLink size={9} />}
              </a>
            ))}
          </div>
        )}

        {/* Dynamic Suggested Follow-ups */}
        {!isUser &&
          message.suggestedQuestions &&
          message.suggestedQuestions.length > 0 &&
          onSelectSuggestion && (
            <div className="flex flex-col gap-1.5 pt-1 w-full pl-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Suggested Follow-ups
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectSuggestion(q)}
                    className="text-left text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors font-medium cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};

interface ParsedBlock {
  type: "paragraph" | "bullet" | "numbered" | "heading" | "table" | "empty";
  content?: string;
  num?: string;
  level?: number;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

function parseMarkdownBlocks(text: string): ParsedBlock[] {
  const lines = text.split("\n");
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      blocks.push({ type: "empty" });
      i++;
      continue;
    }

    // Check for Markdown table block (starts and ends with |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const splitRow = (row: string) =>
          row
            .slice(1, -1)
            .split("|")
            .map(cell => cell.trim());

        const headers = splitRow(tableLines[0]);
        const isDivider = (row: string) => /^[\s-:]+(\|[\s-:]+)+$/.test(row.slice(1, -1));

        let dataRowStartIndex = 1;
        if (isDivider(tableLines[1])) {
          dataRowStartIndex = 2;
        }

        const rows: string[][] = [];
        for (let r = dataRowStartIndex; r < tableLines.length; r++) {
          rows.push(splitRow(tableLines[r]));
        }

        blocks.push({
          type: "table",
          tableData: { headers, rows },
        });
        continue;
      }
    }

    // Heading (# ## ###)
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      i++;
      continue;
    }

    // Bullet point
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
      blocks.push({
        type: "bullet",
        content: trimmed.replace(/^[-•*]\s*/, ""),
      });
      i++;
      continue;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s*(.*)$/);
    if (numMatch) {
      blocks.push({
        type: "numbered",
        num: numMatch[1],
        content: numMatch[2],
      });
      i++;
      continue;
    }

    // Standard paragraph
    blocks.push({
      type: "paragraph",
      content: trimmed,
    });
    i++;
  }

  return blocks;
}

/**
 * Lightweight, safe Markdown renderer for structured assistant answers.
 */
function FormattedMarkdown({ content }: { content: string }) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="flex flex-col gap-2 text-[13.5px] leading-relaxed">
      {blocks.map((block, idx) => {
        // Empty spacer
        if (block.type === "empty") {
          return <div key={idx} className="h-1" />;
        }

        // Heading
        if (block.type === "heading") {
          return (
            <h4
              key={idx}
              className={`font-bold text-slate-900 mt-1 mb-0.5 ${
                block.level === 1 ? "text-base" : "text-[14px]"
              }`}
            >
              <InlineFormatting text={block.content || ""} />
            </h4>
          );
        }

        // Table rendered as clean, readable cards
        if (block.type === "table" && block.tableData) {
          const { headers, rows } = block.tableData;
          return (
            <div key={idx} className="flex flex-col gap-2.5 my-2 w-full">
              {rows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 shadow-xs flex flex-col gap-2"
                >
                  {row.map((cell, cIdx) => {
                    const header = headers[cIdx];
                    const cellParts = cell
                      .split(/<br\s*\/?>/i)
                      .map(p => p.trim())
                      .filter(Boolean);

                    return (
                      <div key={cIdx} className="flex flex-col gap-1">
                        {header && (
                          <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider">
                            {header}
                          </span>
                        )}
                        <div className="text-[13px] text-slate-800 leading-relaxed flex flex-col gap-1">
                          {cellParts.map((part, pIdx) => {
                            const isBullet = part.startsWith("• ") || part.startsWith("- ");
                            const cleanPart = isBullet ? part.replace(/^[-•]\s*/, "") : part;
                            return (
                              <div
                                key={pIdx}
                                className={isBullet ? "flex items-start gap-1.5 pl-1" : ""}
                              >
                                {isBullet && (
                                  <span className="text-blue-500 font-bold mt-0.5 text-xs">•</span>
                                )}
                                <span className="flex-1">
                                  <InlineFormatting text={cleanPart} />
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        }

        // Bullet point
        if (block.type === "bullet") {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-blue-500 font-bold mt-1 text-xs">•</span>
              <span className="flex-1">
                <InlineFormatting text={block.content || ""} />
              </span>
            </div>
          );
        }

        // Numbered list
        if (block.type === "numbered") {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-blue-600 font-semibold text-xs mt-0.5">
                {block.num}.
              </span>
              <span className="flex-1">
                <InlineFormatting text={block.content || ""} />
              </span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="m-0">
            <InlineFormatting text={block.content || ""} />
          </p>
        );
      })}
    </div>
  );
}

function InlineFormatting({ text }: { text: string }) {
  // Clean raw <br> tags if any remain
  const clean = text.replace(/<br\s*\/?>/gi, " ");

  // Parse bold **text** and `code`
  const parts = clean.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[12px] font-mono border border-slate-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

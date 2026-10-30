"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  AlertCircle,
  HelpCircle,
  FileSearch,
  ClipboardPaste,
  Trash2,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import { ChatMessageItem, type Message } from "./ChatMessageItem";
import { JDAnalysisCard } from "./JDAnalysisCard";
import type { JDAnalysisResult } from "@/app/lib/rag/jd-analyzer";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMode = "chat" | "jd";

interface JDMessage {
  id: string;
  type: "jd-input" | "jd-result" | "jd-error";
  timestamp: string;
  jdText?: string;
  result?: JDAnalysisResult;
  error?: string;
}

type ConversationItem = Message | JDMessage;

function isJDMessage(item: ConversationItem): item is JDMessage {
  return "type" in item && (
    item.type === "jd-input" ||
    item.type === "jd-result" ||
    item.type === "jd-error"
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STARTER_QUESTIONS = [
  "Tell me about Parth's internship at Shakktii AI.",
  "What projects has he built?",
  "Which technologies does QuizLab use?",
  "What are Parth's strongest technical skills?",
  "What achievements or patents are in his portfolio?",
];

const JD_MAX_CHARS = 6000;

const WELCOME_MESSAGE: Message = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "Hi! I'm Parth's AI Portfolio Assistant. Ask me about his projects, technical skills, internship experience, or professional background.",
  timestamp: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");

  // Chat state
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // JD state
  const [jdText, setJdText] = useState("");
  const [jdItems, setJdItems] = useState<ConversationItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  const activeJDTextRef = useRef<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const jdEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredOrOpenedRef = useRef(false);

  // ── Init welcome message ──────────────────────────────────────────────────

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ ...WELCOME_MESSAGE, timestamp: now() }]);
    }
  }, [messages.length]);

  // ── Auto-open after 10s ───────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) hasTriggeredOrOpenedRef.current = true;
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasTriggeredOrOpenedRef.current) {
        hasTriggeredOrOpenedRef.current = true;
        setIsOpen(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && mode === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen, mode]);

  useEffect(() => {
    if (isOpen && mode === "jd") {
      jdEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [jdItems, isAnalyzing, isOpen, mode]);

  // ── Focus on open ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 640) {
          if (mode === "chat") inputRef.current?.focus({ preventScroll: true });
          else jdInputRef.current?.focus({ preventScroll: true });
        }
      }, 180);
    }
  }, [isOpen, mode]);

  // ── ESC to close ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // ─── Chat handler (unchanged logic) ───────────────────────────────────────

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend || input).trim();
      if (!query || isLoading) return;

      setError(null);
      setInput("");

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: now(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        const history = newMessages
          .filter(m => m.id !== "welcome-msg")
          .slice(-6)
          .map(m => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query, history }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || data.answer || "Failed to receive an answer.");

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer || "I couldn't find enough information to answer that.",
          sources: data.sources || [],
          suggestedQuestions: data.suggestedQuestions || [],
          timestamp: now(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error("[Chatbot] Error:", err);
        setError(err?.message || "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  // ─── JD analysis handler ──────────────────────────────────────────────────

  const handleAnalyzeJD = useCallback(async () => {
    const jd = jdText.trim();
    if (!jd || isAnalyzing) return;
    if (jd.length < 50) {
      setJdError("Please paste more of the job description (at least 50 characters).");
      return;
    }

    setJdError(null);
    setIsAnalyzing(true);
    activeJDTextRef.current = jd;

    // Record the JD input as a conversation item
    const inputItem: JDMessage = {
      id: `jd-input-${Date.now()}`,
      type: "jd-input",
      jdText: jd.slice(0, 200) + (jd.length > 200 ? "…" : ""),
      timestamp: now(),
    };
    setJdItems(prev => [...prev, inputItem]);
    setJdText("");

    try {
      const res = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");

      const resultItem: JDMessage = {
        id: `jd-result-${Date.now()}`,
        type: "jd-result",
        result: data as JDAnalysisResult,
        timestamp: now(),
      };
      setJdItems(prev => [...prev, resultItem]);
    } catch (err: any) {
      const errItem: JDMessage = {
        id: `jd-error-${Date.now()}`,
        type: "jd-error",
        error: err?.message || "Analysis failed. Please try again.",
        timestamp: now(),
      };
      setJdItems(prev => [...prev, errItem]);
      setJdError(null); // shown inline in item
    } finally {
      setIsAnalyzing(false);
    }
  }, [jdText, isAnalyzing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again if needed
    e.target.value = "";

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt", "md"].includes(ext || "")) {
      setJdError("Please upload a PDF (.pdf), Word document (.docx), or text file (.txt).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setJdError("File exceeds 8MB size limit.");
      return;
    }

    setIsUploadingDoc(true);
    setJdError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract text from document.");
      }

      setJdText(data.text.slice(0, JD_MAX_CHARS));
      setUploadedFileName(file.name);
    } catch (err: any) {
      console.error("[FileUpload] Error:", err);
      setJdError(err?.message || "Failed to process document.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleResetChat = () => {
    setMessages([{ ...WELCOME_MESSAGE, timestamp: now() }]);
    setError(null);
    setInput("");
  };

  const handleResetJD = () => {
    setJdItems([]);
    setJdText("");
    setUploadedFileName(null);
    setJdError(null);
    activeJDTextRef.current = "";
  };

  const handleAnalyzeAnother = () => {
    setUploadedFileName(null);
    activeJDTextRef.current = "";
    // Keep jdItems history but allow new paste
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating AI Trigger Button ──────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            hasTriggeredOrOpenedRef.current = true;
            setIsOpen(!isOpen);
          }}
          aria-label={isOpen ? "Close AI Assistant" : "Ask AI Portfolio Assistant"}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-slate-800 font-semibold text-sm border border-slate-200/90 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md"
          style={{
            boxShadow:
              "0 4px 18px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
          <Sparkles size={15} className="text-blue-600 group-hover:rotate-12 transition-transform" />
          <span className="tracking-tight text-[13.5px] text-slate-800 group-hover:text-blue-600 transition-colors">
            Ask AI
          </span>
        </button>
      </div>

      {/* ── Chat Window Dialog ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-label="Parth's AI Portfolio Assistant"
            aria-modal="true"
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[620px] max-h-[86vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            style={{
              boxShadow:
                "0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(226, 232, 240, 0.8)",
            }}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Bot size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight leading-none text-slate-900">
                    Parth&apos;s AI Assistant
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={mode === "chat" ? handleResetChat : handleResetJD}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  aria-label="Close assistant"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* ── Mode Tabs ── */}
            <div className="flex border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
              <button
                onClick={() => setMode("chat")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${
                  mode === "chat"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <MessageSquare size={13} />
                Portfolio Chat
              </button>
              <button
                onClick={() => setMode("jd")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold transition-colors cursor-pointer ${
                  mode === "jd"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <FileSearch size={13} />
                Check My Profile Fit
              </button>
            </div>

            {/* ─────────────────────────────────────────────────────────── */}
            {/* CHAT MODE                                                   */}
            {/* ─────────────────────────────────────────────────────────── */}
            {mode === "chat" && (
              <>
                <div
                  data-lenis-prevent
                  className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/60"
                  aria-live="polite"
                >
                  {messages.map(msg => (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      onSelectSuggestion={q => handleSendMessage(q)}
                    />
                  ))}

                  {/* Starter questions */}
                  {messages.length === 1 && (
                    <div className="mt-1 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 px-1">
                        <HelpCircle size={13} className="text-blue-600" />
                        <span>Suggested Questions</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {STARTER_QUESTIONS.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-left text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 transition-all font-medium shadow-2xs cursor-pointer flex items-center justify-between group"
                          >
                            <span>{q}</span>
                            <Sparkles
                              size={11}
                              className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity flex-shrink-0 ml-2"
                            />
                          </button>
                        ))}
                      </div>


                    </div>
                  )}

                  {/* Loading */}
                  {isLoading && (
                    <div className="flex gap-2.5 items-center text-xs text-slate-500 pl-1 py-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Bot size={13} />
                      </div>
                      <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.3s]" />
                        <span className="ml-2 text-[11px] text-slate-500 font-medium">
                          Retrieving evidence &amp; thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-600" />
                      <div className="flex-1">
                        <p className="font-semibold">Unable to fetch answer</p>
                        <p className="mt-0.5 text-rose-600">{error}</p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <footer className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value.slice(0, 500))}
                        placeholder="Ask about projects, skills, experience..."
                        disabled={isLoading}
                        className="w-full text-xs sm:text-sm pl-3.5 pr-14 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 text-slate-800 placeholder-slate-400 transition-all"
                      />
                      {input.length > 350 && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                          {input.length}/500
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      aria-label="Send question"
                      className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-sm cursor-pointer"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                  <div className="flex justify-between items-center mt-1.5 px-1 text-[10px] text-slate-400">
                    <span>Answers grounded strictly in verified portfolio data.</span>
                    <span>Press Enter ↵</span>
                  </div>
                </footer>
              </>
            )}

            {/* ─────────────────────────────────────────────────────────── */}
            {/* JD ANALYZER MODE                                            */}
            {/* ─────────────────────────────────────────────────────────── */}
            {mode === "jd" && (
              <>
                <div
                  data-lenis-prevent
                  className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/60"
                  aria-live="polite"
                >
                  {/* Empty state prompt */}
                  {jdItems.length === 0 && !isAnalyzing && (
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <FileSearch size={22} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Check My Profile Fit</p>
                        <p className="text-[12px] text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                          Paste a job description or upload a document (PDF, Word, TXT) to analyze how well Parth matches the role.
                        </p>
                      </div>

                      {/* Document upload quick card */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingDoc || isAnalyzing}
                        className="mt-1 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 transition-all font-medium text-xs shadow-2xs cursor-pointer group"
                      >
                        {isUploadingDoc ? (
                          <Loader2 size={13} className="animate-spin text-blue-600" />
                        ) : (
                          <Upload size={13} className="text-blue-600 group-hover:-translate-y-0.5 transition-transform" />
                        )}
                        <span>{isUploadingDoc ? "Reading document..." : "Upload Job Description (PDF / DOCX)"}</span>
                      </button>
                    </div>
                  )}

                  {/* Conversation items */}
                  {jdItems.map(item => {
                    if (isJDMessage(item)) {
                      if (item.type === "jd-input") {
                        return (
                          <div key={item.id} className="flex justify-end">
                            <div className="max-w-[85%] flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-[12px] rounded-2xl rounded-tr-sm shadow-xs">
                                <ClipboardPaste size={11} className="text-slate-300 flex-shrink-0" />
                                <span className="text-slate-200 italic">
                                  {item.jdText}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                            </div>
                          </div>
                        );
                      }

                      if (item.type === "jd-result" && item.result) {
                        return (
                          <div key={item.id} className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 px-1">
                              <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <Bot size={13} />
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Analysis complete
                              </span>
                              <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                            </div>
                            <JDAnalysisCard
                              analysis={item.result}
                              onAnalyzeAnother={handleAnalyzeAnother}
                            />
                          </div>
                        );
                      }

                      if (item.type === "jd-error") {
                        return (
                          <div
                            key={item.id}
                            className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs"
                          >
                            <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-600" />
                            <div>
                              <p className="font-semibold">Analysis failed</p>
                              <p className="mt-0.5 text-rose-600">{item.error}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    // Regular chat message (follow-up Q&A in JD pane)
                    return (
                      <ChatMessageItem
                        key={item.id}
                        message={item as Message}
                      />
                    );
                  })}

                  {/* Analyzing loader */}
                  {isAnalyzing && (
                    <div className="flex gap-2.5 items-center text-xs text-slate-500 pl-1 py-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Bot size={13} />
                      </div>
                      <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.3s]" />
                        <span className="ml-2 text-[11px] text-slate-500 font-medium">
                          Analyzing JD against portfolio…
                        </span>
                      </div>
                    </div>
                  )}

                  {/* JD inline error */}
                  {jdError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-600" />
                      <p>{jdError}</p>
                    </div>
                  )}

                  <div ref={jdEndRef} />
                </div>

                {/* JD Input Area */}
                <footer className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
                  {/* JD paste input with file upload */}
                  <div className="flex flex-col gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Upload status chip if a file was read */}
                    {uploadedFileName && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText size={12} className="flex-shrink-0" />
                          <span className="truncate font-medium">{uploadedFileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFileName(null);
                            setJdText("");
                          }}
                          className="text-blue-500 hover:text-blue-700 ml-2 font-bold text-xs cursor-pointer"
                          title="Remove file text"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <textarea
                      ref={jdInputRef}
                      value={jdText}
                      onChange={e => {
                        setJdText(e.target.value.slice(0, JD_MAX_CHARS));
                        setJdError(null);
                      }}
                      placeholder="Paste the job description here, or upload a PDF/DOCX file below…"
                      disabled={isAnalyzing || isUploadingDoc}
                      rows={3}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 text-slate-800 placeholder-slate-400 transition-all resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Upload button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isAnalyzing || isUploadingDoc}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                          title="Upload PDF or Word document"
                        >
                          {isUploadingDoc ? (
                            <Loader2 size={11} className="animate-spin text-blue-600" />
                          ) : (
                            <Upload size={11} />
                          )}
                          <span>{isUploadingDoc ? "Reading..." : "Upload PDF / DOC"}</span>
                        </button>

                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                          {jdText.length}/{JD_MAX_CHARS}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {jdText.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setJdText("");
                              setUploadedFileName(null);
                              setJdError(null);
                            }}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            <Trash2 size={11} />
                            Clear
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAnalyzeJD}
                          disabled={isAnalyzing || isUploadingDoc || jdText.trim().length < 50}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <FileSearch size={13} />
                          {isAnalyzing ? "Analyzing…" : "Analyze Fit"}
                        </button>
                      </div>
                    </div>
                  </div>
                </footer>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

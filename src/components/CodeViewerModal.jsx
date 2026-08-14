import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, prism as prismLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { X, Copy, Check } from "lucide-react";

const LANGUAGE_MAP = {
  cpp: "cpp",
  c: "c",
  java: "java",
  python: "python",
  javascript: "javascript",
};

const VERDICT_STYLES = {
  Accepted: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "Wrong Answer": "text-rose-400 bg-rose-500/10 border-rose-500/30",
  "Time Limit Exceeded": "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "Memory Limit Exceeded": "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "Runtime Error": "text-orange-400 bg-orange-500/10 border-orange-500/30",
  "Compilation Error": "text-orange-400 bg-orange-500/10 border-orange-500/30",
  Pending: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

const CodeViewerModal = ({ submission, onClose }) => {
  const [copied, setCopied] = useState(false);

  const getIsDark = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) return true;
    if (root.classList.contains("light")) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const mediaHandler = () => {
      setIsDark(getIsDark());
    };
    media.addEventListener("change", mediaHandler);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", mediaHandler);
    };
  }, []);

  if (!submission) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(submission.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const verdictStyle = VERDICT_STYLES[submission.verdict] || VERDICT_STYLES.Pending;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {submission.problemTitle || submission.problemId}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>By {submission.username}</span>
              <span>•</span>
              <span className="uppercase">{submission.language}</span>
              <span>•</span>
              <span>{new Date(submission.submittedAt).toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Verdict + stats bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-950/50 px-5 py-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${verdictStyle}`}>
            {submission.verdict}
          </span>
          <span className="text-xs text-slate-400">
            Time: <span className="text-slate-200">{submission.executionTime} ms</span>
          </span>
          <span className="text-xs text-slate-400">
            Memory: <span className="text-slate-200">{submission.memoryUsed} KB</span>
          </span>
          <button
            onClick={handleCopy}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:border-brand-500 hover:text-brand-400"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Code"}
          </button>
        </div>

        {/* Code */}
        <div className="overflow-auto">
          <SyntaxHighlighter
            language={LANGUAGE_MAP[submission.language] || "text"}
            style={isDark ? vscDarkPlus : prismLight}
            showLineNumbers
            customStyle={{
              margin: 0,
              padding: "1.25rem",
              fontSize: "0.85rem",
              background: isDark ? "rgb(var(--slate-900))" : "rgb(var(--slate-950))",
              minHeight: "200px",
            }}
          >
            {submission.code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default CodeViewerModal;

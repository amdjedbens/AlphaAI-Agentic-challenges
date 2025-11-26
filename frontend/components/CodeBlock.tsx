'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'json', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block relative group">
      {title && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--accent-cyan)]/10">
          <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">{title}</span>
          <span className="text-xs text-[var(--accent-cyan)] font-medium">{language}</span>
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-[#0b0f2b]/80 border border-[var(--accent-cyan)]/20 opacity-0 group-hover:opacity-100 transition-all hover:border-[var(--accent-cyan)]/40"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white/40 hover:text-[var(--accent-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <pre className="text-white/70 whitespace-pre-wrap break-words text-sm">
        {code}
      </pre>
    </div>
  );
}

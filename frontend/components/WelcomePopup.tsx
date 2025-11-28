'use client';

import { useState, useEffect } from 'react';

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = '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';

  useEffect(() => {
    // Check if popup has been shown this session
    const hasSeenPopup = sessionStorage.getItem('welcome_popup_shown');
    if (!hasSeenPopup) {
      // Small delay for smoother UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('welcome_popup_shown', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-scaleIn">
        <div className="bg-gradient-to-br from-[#1a2150] to-[#0d1333] rounded-2xl border border-[var(--accent-cyan)]/30 shadow-2xl shadow-[var(--accent-cyan)]/10 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center text-lg">
                  👋
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Hey there!</h3>
                  <p className="text-white/50 text-sm">From Amdjed</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <p className="text-white/70 text-sm leading-relaxed">
              I apologize for any inconvenience, concerning the deployment of the challenges! If you need an OpenAI API key for the challenge, feel free to use this one:
            </p>
          </div>

          {/* API Key Box */}
          <div className="px-6 pb-6">
            <div className="bg-[#0b0f2b] rounded-xl border border-[var(--accent-cyan)]/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <code className="text-[var(--accent-cyan)] text-xs font-mono truncate flex-1">
                  {apiKey.slice(0, 20)}...{apiKey.slice(-10)}
                </code>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    copied 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 hover:bg-[var(--accent-cyan)]/20'
                  }`}
                >
                  {copied ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[#00d9c7] text-[#0b0f2b] font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Got it, thanks! 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


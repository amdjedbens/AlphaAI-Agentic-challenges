'use client';

import { useState, useEffect } from 'react';

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);

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
              I apologize for any inconvenience concerning the deployment of the challenges!
            </p>
          </div>

          {/* Discord Info Box */}
          <div className="px-6 pb-6">
            <div className="bg-[#0b0f2b] rounded-xl border border-[var(--accent-purple)]/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Need an OpenAI API key?</p>
                  <p className="text-white/50 text-xs">Find it in the <span className="text-[#5865F2] font-semibold">#announcement</span> channel on Discord</p>
                </div>
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

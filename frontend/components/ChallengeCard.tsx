import Link from 'next/link';
import type { Challenge } from '@/lib/api';
import React from 'react';

// 🔒 CHALLENGE LOCK: Set to false when competition starts
const CHALLENGES_LOCKED = true;

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const difficultyClass = {
    Beginner: 'badge-beginner',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  }[challenge.difficulty] || 'badge-beginner';

  const themeIcons: Record<string, React.ReactNode> = {
    Research: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    'Law / Compliance': (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  };

  const themeColors: Record<string, { bg: string; text: string }> = {
    Research: {
      bg: 'from-[var(--accent-cyan)]/20 to-emerald-500/20',
      text: 'text-[var(--accent-cyan)]',
    },
    'Law / Compliance': {
      bg: 'from-amber-500/20 to-orange-500/20',
      text: 'text-amber-400',
    },
  };

  const colors = themeColors[challenge.theme] || themeColors.Research;

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <div className="card card-hover p-6 h-full flex flex-col group">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center ${colors.text}`}>
            {themeIcons[challenge.theme] || themeIcons.Research}
          </div>
          <span className={`badge ${difficultyClass}`}>{challenge.difficulty}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--accent-cyan)] transition-colors">
          {challenge.name}
        </h3>
        <p className="text-white/60 text-sm mb-4 flex-grow">
          {challenge.description}
        </p>

        <div className="border-t border-[var(--accent-cyan)]/10 pt-4 mt-auto">
          <div className="flex items-center justify-between text-sm">
            {CHALLENGES_LOCKED ? (
              <>
                <span className="text-amber-400/80 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Unlocks Nov 27
                </span>
                <span className="text-white/40 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Preview
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </>
            ) : (
              <>
                <span className="text-white/40">
                  {challenge.sample_questions} sample / {challenge.total_questions} total questions
                </span>
                <span className="text-[var(--accent-cyan)] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Challenge
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

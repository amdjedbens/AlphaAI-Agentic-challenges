'use client';

import { useState, useEffect } from 'react';

// Production API URL (hardcoded for hackathon)
const API_BASE_URL = 'https://squid-app-7q77b.ondigitalocean.app/api';

interface PublicLeaderboardEntry {
  teamId: number;
  teamName: string;
  displayScore: string;
}

interface PrivateLeaderboardEntry {
  teamId: number;
  submissionId: number;
  rank: number;
  displayScore: string;
}

interface ChallengeLeaderboard {
  public: PublicLeaderboardEntry[];
  private: PrivateLeaderboardEntry[];
}

interface LeaderboardResponse {
  [key: string]: ChallengeLeaderboard;
}

export default function LeaderboardPage() {
  const [selectedChallenge, setSelectedChallenge] = useState('factcheck');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Using v2 endpoint which returns both challenges
      const response = await fetch(
        `${API_BASE_URL}/api/public/leaderboard/v2`
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const currentLeaderboard = leaderboardData ? leaderboardData[selectedChallenge]?.public || [] : [];

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30';
      case 2:
        return 'bg-gradient-to-r from-slate-400/20 to-gray-400/20 text-slate-300 border-slate-400/30';
      case 3:
        return 'bg-gradient-to-r from-orange-600/20 to-amber-600/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-[var(--card-bg)] text-white/40 border-[var(--accent-cyan)]/20';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ background: 'linear-gradient(180deg, #0b0f2b 0%, rgba(19, 37, 98, 1) 50%, rgba(43, 71, 176, 1) 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h1 className="text-4xl md:text-5xl font-black text-white">Leaderboard</h1>
          </div>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Top performing RAG agents at the <span className="text-[var(--accent-cyan)] font-semibold">Alpha AI Datathon</span>. Can you reach the top?
          </p>
        </div>

        {/* Challenge Tabs */}
        <div className="card p-2 mb-8 inline-flex w-full">
          <button
            onClick={() => setSelectedChallenge('factcheck')}
            className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${selectedChallenge === 'factcheck'
                ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[#00d9c7] text-[#0b0f2b]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <span className="hidden sm:inline">The </span>Fact-Check Spider
          </button>
          <button
            onClick={() => setSelectedChallenge('legal')}
            className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${selectedChallenge === 'legal'
                ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[#00d9c7] text-[#0b0f2b]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <span className="hidden sm:inline">The </span>Legal Clerk
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <svg className="animate-spin w-8 h-8 mx-auto text-[var(--accent-cyan)]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-4 text-white/40">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : currentLeaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-white/40">No submissions yet. Be the first!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--accent-cyan)]/10 bg-[#0b0f2b]/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/40">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/40">Team</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white/40">
                    <span className="flex items-center justify-end gap-2">
                      Best Score
                      <span className="text-xs text-[var(--accent-cyan)]">★</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentLeaderboard.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={`${entry.teamName}-${rank}`}
                      className="border-b border-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)]/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${getRankStyle(rank)}`}>
                          {getRankIcon(rank) || rank}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">{entry.teamName}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xl font-bold text-[var(--accent-cyan)]">
                          {parseFloat(entry.displayScore).toFixed(4)}
                        </span>
                        <span className="text-white/40">/10</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Scoring Info */}
        <div className="card p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--accent-cyan)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-xl font-bold text-white">Scoring System</h2>
          </div>
          
          {/* Best Score Explanation */}
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-cyan)]/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[var(--accent-cyan)] text-lg">★</span>
              <span className="font-bold text-white">Best Score = Max(Public, Private)</span>
            </div>
            <p className="text-white/60 text-sm">
              Your leaderboard ranking is based on your <strong className="text-[var(--accent-cyan)]">best performance</strong> — 
              the maximum of your public and private test scores. No weighted average, just your highest score!
            </p>
          </div>

          <h3 className="font-semibold text-white/80 mb-4">Component Weights</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/20">
              <div className="text-3xl font-black text-[var(--accent-cyan)] mb-2">25%</div>
              <div className="text-sm text-white/60">Retrieval Score</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--accent-purple)]/5 border border-[var(--accent-purple)]/20">
              <div className="text-3xl font-black text-[var(--accent-purple)] mb-2">35%</div>
              <div className="text-sm text-white/60">Answer Correctness</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="text-3xl font-black text-emerald-400 mb-2">25%</div>
              <div className="text-sm text-white/60">Faithfulness</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="text-3xl font-black text-amber-400 mb-2">15%</div>
              <div className="text-sm text-white/60">Reasoning Quality</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

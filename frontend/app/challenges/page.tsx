import { ChallengeCard } from '@/components/ChallengeCard';

// Static challenges data (matches backend)
const challenges = [
  {
    id: 'factcheck',
    name: 'The Fact-Check Spider',
    difficulty: 'Beginner',
    description: 'Verify claims against a Wikipedia-style knowledge base. Search for evidence, retrieve relevant documents, and determine if claims are True, False, or Partially True.',
    theme: 'Research',
    kb_endpoint: '/api/api/kb/factcheck/search',
    sample_questions: 10,
    total_questions: 50,
    metrics: ['Retrieval Recall', 'Verdict Accuracy', 'Hallucination Detection'],
    expected_output: {
      thought_process: 'Your reasoning steps...',
      retrieved_context_ids: ['doc_1', 'doc_2'],
      final_answer: 'True/False/Partially True',
      citation: 'doc_id, relevant quote',
    },
  },
  {
    id: 'legal',
    name: 'The Legal Clerk',
    difficulty: 'Medium',
    description: 'Answer zoning law questions by synthesizing potentially conflicting rules. Must identify contradictions and provide clause-based citations.',
    theme: 'Law / Compliance',
    kb_endpoint: '/api/api/kb/legal/search',
    sample_questions: 10,
    total_questions: 50,
    metrics: ['Answer Faithfulness', 'Conflict Detection', 'Citation Accuracy'],
    expected_output: {
      thought_process: 'Your reasoning steps...',
      retrieved_context_ids: ['clause_1', 'clause_2'],
      final_answer: 'Yes/No with explanation',
      citation: 'Clause X.Y.Z',
    },
  },
];

export default function ChallengesPage() {
  return (
    <div className="min-h-screen py-12" style={{ background: 'linear-gradient(180deg, #0b0f2b 0%, rgba(19, 37, 98, 1) 50%, rgba(43, 71, 176, 1) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h1 className="text-4xl md:text-5xl font-black text-white">Challenges</h1>
          </div>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Each challenge tests different RAG capabilities at the <span className="text-[var(--accent-cyan)] font-semibold">Alpha AI Datathon</span>. Start with Beginner and work your way up.
          </p>
        </div>

        {/* Challenge Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>

        {/* Evaluation Info */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent-cyan)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-2xl font-bold text-white">How Evaluation Works</h2>
          </div>
          
          {/* Best Score Highlight */}
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-cyan)]/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[var(--accent-cyan)] text-lg">★</span>
              <span className="font-bold text-white">Best Score Wins!</span>
            </div>
            <p className="text-white/60 text-sm">
              Your leaderboard score is the <strong className="text-[var(--accent-cyan)]">maximum</strong> of your public and private test scores — we reward your best performance!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center text-[var(--accent-cyan)] mb-4 mx-auto md:mx-0">
                <span className="font-bold text-xl">25%</span>
              </div>
              <h3 className="font-bold text-white mb-2">Retrieval Score</h3>
              <p className="text-sm text-white/60">
                Did your agent find the correct documents? We check if the golden documents appear in your retrieved context.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-purple)]/20 to-[var(--accent-magenta)]/20 flex items-center justify-center text-[var(--accent-purple)] mb-4 mx-auto md:mx-0">
                <span className="font-bold text-xl">35%</span>
              </div>
              <h3 className="font-bold text-white mb-2">Answer Correctness</h3>
              <p className="text-sm text-white/60">
                Is your answer correct? We evaluate verdict accuracy for factcheck and answer quality for legal.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-magenta)]/20 to-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-magenta)] mb-4 mx-auto md:mx-0">
                <span className="font-bold text-xl">40%</span>
              </div>
              <h3 className="font-bold text-white mb-2">Faithfulness + Reasoning</h3>
              <p className="text-sm text-white/60">
                Is your answer grounded in documents? Did you reason through it correctly? No hallucinations allowed!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

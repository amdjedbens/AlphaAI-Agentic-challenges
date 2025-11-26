import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { notFound } from 'next/navigation';

// Challenge data
const challengeData: Record<string, {
  id: string;
  name: string;
  difficulty: string;
  description: string;
  theme: string;
  kb_endpoint: string;
  metrics: string[];
  overview: string;
  instructions: string[];
  sampleQuestions: { id: string; text: string }[];
  expectedOutput: object;
}> = {
  factcheck: {
    id: 'factcheck',
    name: 'The Fact-Check Spider',
    difficulty: 'Beginner',
    description: 'Verify claims against a Wikipedia-style knowledge base.',
    theme: 'Research',
    kb_endpoint: '/api/kb/factcheck/search',
    metrics: ['Retrieval Recall', 'Verdict Accuracy', 'Hallucination Detection'],
    overview: `Your agent receives claims that need to be verified. Using our Wikipedia-style knowledge base, 
    your agent must search for relevant documents, analyze the evidence, and determine if each claim is 
    True, False, or Partially True. Citations must be provided to support the verdict.`,
    instructions: [
      'Use the Knowledge Base API to search for relevant documents',
      'Analyze the retrieved content to verify the claim',
      'Return a verdict: True, False, or Partially True',
      'Include document IDs and relevant quotes as citations',
      'Document your reasoning in the thought_process field',
    ],
    sampleQuestions: [
      { id: 'fc_dev_1', text: 'The Eiffel Tower was completed in 1889 for the World\'s Fair.' },
      { id: 'fc_dev_2', text: 'Albert Einstein was born in Germany in 1879.' },
      { id: 'fc_dev_3', text: 'The Great Wall of China is visible from the Moon with the naked eye.' },
      { id: 'fc_dev_4', text: 'Water boils at 100 degrees Celsius at sea level.' },
      { id: 'fc_dev_5', text: 'The Amazon River is the longest river in the world.' },
    ],
    expectedOutput: {
      thought_process: "I need to verify this claim about the Eiffel Tower. Let me search for information about its construction...",
      retrieved_context_ids: ["wiki_eiffel_tower"],
      final_answer: "True",
      citation: "wiki_eiffel_tower: 'constructed from 1887 to 1889 as the centerpiece of the 1889 World's Fair'"
    },
  },
  legal: {
    id: 'legal',
    name: 'The Legal Clerk',
    difficulty: 'Medium',
    description: 'Answer zoning law questions requiring conflict resolution.',
    theme: 'Law / Compliance',
    kb_endpoint: '/api/kb/legal/search',
    metrics: ['Answer Faithfulness', 'Conflict Detection', 'Citation Accuracy'],
    overview: `Your agent serves as a legal clerk answering questions about the Alphaville Zoning Code. 
    The code contains intentionally conflicting rules that require careful analysis. Your agent must 
    identify relevant clauses, detect conflicts, and provide well-reasoned answers with proper citations.`,
    instructions: [
      'Search the Zoning Code for relevant clauses',
      'Identify any conflicting rules that apply to the question',
      'Synthesize the information to provide a clear answer',
      'Cite specific clause IDs (e.g., clause_B_2)',
      'Explain any conflicts or exceptions in your reasoning',
    ],
    sampleQuestions: [
      { id: 'legal_dev_1', text: 'Can I build a 3-story residential building in Zone B?' },
      { id: 'legal_dev_2', text: 'What is the maximum lot coverage allowed in Zone A-Commercial?' },
      { id: 'legal_dev_3', text: 'Can I operate a home-based bakery in Zone R-1?' },
      { id: 'legal_dev_4', text: 'What setback requirements apply to corner lots in Zone B?' },
      { id: 'legal_dev_5', text: 'Are solar panels allowed on historic buildings in the Heritage District?' },
    ],
    expectedOutput: {
      thought_process: "I need to check Zone B height limits. Let me search for relevant clauses... I found clause_B_2 allows 4 stories, but clause_B_2_conflict limits to 2 stories near R-1 boundaries...",
      retrieved_context_ids: ["clause_B_2", "clause_B_2_conflict"],
      final_answer: "It depends on the location. Generally, Zone B allows up to 4 stories for residential buildings. However, if the property is within 500 feet of Zone R-1 boundaries, the limit is reduced to 2 stories.",
      citation: "clause_B_2 (4 stories general), clause_B_2_conflict (2 stories near R-1)"
    },
  },
};

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = challengeData[id];

  if (!challenge) {
    notFound();
  }

  const difficultyClass = {
    Beginner: 'badge-beginner',
    Medium: 'badge-medium',
    Hard: 'badge-hard',
  }[challenge.difficulty] || 'badge-beginner';

  return (
    <div className="min-h-screen py-12" style={{ background: 'linear-gradient(180deg, #0b0f2b 0%, rgba(19, 37, 98, 1) 50%, rgba(43, 71, 176, 1) 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/challenges" className="text-white/40 hover:text-[var(--accent-cyan)] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Challenges
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className={`badge ${difficultyClass}`}>{challenge.difficulty}</span>
            <span className="text-white/40">{challenge.theme}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{challenge.name}</h1>
          <p className="text-xl text-white/60">{challenge.description}</p>
        </div>

        {/* Overview */}
        <section className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-cyan)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Overview</h2>
          </div>
          <p className="text-white/60 leading-relaxed">{challenge.overview}</p>
        </section>

        {/* Metrics */}
        <section className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-purple)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Evaluation Metrics</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {challenge.metrics.map((metric) => (
              <span key={metric} className="px-4 py-2 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-sm font-medium border border-[var(--accent-cyan)]/20">
                {metric}
              </span>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Instructions</h2>
          </div>
          <ol className="space-y-4">
            {challenge.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-4">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center text-sm font-bold text-[var(--accent-cyan)] shrink-0">
                  {index + 1}
                </span>
                <span className="text-white/60 pt-1">{instruction}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* API Endpoint */}
        <section className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-cyan)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Knowledge Base API</h2>
          </div>
          <div className="mb-6">
            <p className="text-white/60 mb-4">
              Use this endpoint to search the knowledge base:
            </p>
            <div className="code-block flex items-center gap-3">
              <code className="text-[var(--accent-cyan)] font-bold">POST</code>
              <code className="text-white">http://localhost:8006{challenge.kb_endpoint}</code>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-white mb-3">Request Body</h3>
              <CodeBlock
                code={JSON.stringify({ query: "your search query", top_k: 5 }, null, 2)}
                language="json"
              />
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Response</h3>
              <CodeBlock
                code={JSON.stringify({
                  results: [
                    { doc_id: "doc_1", content: "...", score: 0.95 }
                  ],
                  query: "your search query",
                  total_results: 1
                }, null, 2)}
                language="json"
              />
            </div>
          </div>
        </section>

        {/* Sample Questions */}
        <section className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-purple)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Sample Questions (Dev Set)</h2>
          </div>
          <p className="text-white/60 mb-6">
            Use these questions to develop and test your agent. The final evaluation will use different questions.
          </p>
          <div className="space-y-3">
            {challenge.sampleQuestions.map((q, index) => (
              <div key={q.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#0b0f2b]/50 border border-[var(--accent-cyan)]/10 hover:border-[var(--accent-cyan)]/30 transition-colors">
                <span className="text-[var(--accent-cyan)] text-sm font-mono font-bold">{index + 1}.</span>
                <span className="text-white/80">{q.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Expected Output */}
        <section className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Expected Output Format</h2>
          </div>
          <p className="text-white/60 mb-6">
            Your agent must return a JSON response in this format:
          </p>
          <CodeBlock
            code={JSON.stringify(challenge.expectedOutput, null, 2)}
            language="json"
            title="Example Response"
          />
        </section>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/submit?challenge=${challenge.id}`} className="btn-primary text-center px-8 py-4">
            Submit Your Agent
          </Link>
          <Link href="/leaderboard" className="btn-secondary text-center px-8 py-4">
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

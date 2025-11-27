'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CodeBlock } from '@/components/CodeBlock';

// Production API URL (hardcoded for hackathon)
const API_BASE_URL = 'https://squid-app-7q77b.ondigitalocean.app/api';

function SubmitForm() {
  const searchParams = useSearchParams();
  const preselectedChallenge = searchParams.get('challenge');

  const [submissionType, setSubmissionType] = useState<'api' | 'python'>('api');
  const [teamKey, setTeamKey] = useState('');
  const [teamName, setTeamName] = useState<string | null>(null);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState(preselectedChallenge || 'factcheck');
  const [apiUrl, setApiUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    submissionId?: number;
  } | null>(null);

  useEffect(() => {
    if (preselectedChallenge) {
      setChallengeId(preselectedChallenge);
    }
  }, [preselectedChallenge]);

  // Validate team key when it changes (with debounce)
  useEffect(() => {
    if (!teamKey || teamKey.length < 8) {
      setTeamName(null);
      setKeyError(null);
      return;
    }

    const validateKey = async () => {
      setIsValidatingKey(true);
      setKeyError(null);
      try {
        const formData = new FormData();
        formData.append('team_key', teamKey);
        
        const response = await fetch(`${API_BASE_URL}/api/submissions/validate-key`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setTeamName(data.team_name);
          setKeyError(null);
        } else {
          setTeamName(null);
          setKeyError(data.detail || 'Invalid key');
        }
      } catch {
        setTeamName(null);
        setKeyError('Could not validate key');
      } finally {
        setIsValidatingKey(false);
      }
    };

    const timer = setTimeout(validateKey, 500);
    return () => clearTimeout(timer);
  }, [teamKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('team_key', teamKey);
      formData.append('challenge_id', challengeId);

      let endpoint = '';
      if (submissionType === 'api') {
        formData.append('api_url', apiUrl);
        endpoint = `${API_BASE_URL}/api/submissions/api-endpoint`;
      } else {
        if (file) {
          formData.append('file', file);
        }
        endpoint = `${API_BASE_URL}/api/submissions/python-file`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Submission received successfully!',
          submissionId: data.submission_id,
        });
      } else {
        setResult({
          success: false,
          message: data.detail || 'Submission failed. Please try again.',
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Failed to connect to the server. Make sure the backend is running.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pythonTemplate = `import requests

def solve(query: str, search_api_url: str) -> dict:
    """
    Your RAG agent implementation.
    
    Args:
        query: The question or claim to process
        search_api_url: URL of the knowledge base search API
    
    Returns:
        dict with keys: thought_process, retrieved_context_ids, 
                       final_answer, citation
    """
    # Step 1: Search the knowledge base
    response = requests.post(search_api_url, json={
        "query": query,
        "top_k": 5
    })
    results = response.json()["results"]
    
    # Step 2: Process results and reason
    context_ids = [r["doc_id"] for r in results]
    context_text = "\\n".join([r["content"] for r in results])
    
    # Step 3: Generate your answer (add your logic here)
    # This is where you'd use an LLM or your own reasoning
    
    return {
        "thought_process": "Your reasoning here...",
        "retrieved_context_ids": context_ids,
        "final_answer": "Your answer here...",
        "citation": f"{context_ids[0]}: relevant quote"
    }`;

  const apiTemplate = `// Submit URL format (using ngrok):
// https://abc123.ngrok-free.app/solve

// Your /solve endpoint receives POST requests with:
{
  "claim": "The claim to verify",  // for factcheck
  // OR
  "query": "The question to answer",  // for legal
  "kb_search_url": "${API_BASE_URL}/api/kb/{challenge}/search"
}

// And must return:
{
  "thought_process": "Your reasoning...",
  "retrieved_context_ids": ["doc_1", "doc_2"],
  "final_answer": "Your answer...",
  "citation": "doc_id: relevant quote"
}`;

  return (
    <>
      {/* Submission Type Toggle */}
      <div className="card p-2 mb-8 inline-flex w-full">
        <button
          onClick={() => setSubmissionType('api')}
          className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
            submissionType === 'api'
              ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[#00d9c7] text-[#0b0f2b]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          API Endpoint
        </button>
        <button
          onClick={() => setSubmissionType('python')}
          className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
            submissionType === 'python'
              ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[#00d9c7] text-[#0b0f2b]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Python File
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-cyan)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h2 className="text-xl font-bold text-white">Submission Details</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Key */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Team Key</label>
              <div className="relative">
                <input
                  type="text"
                  value={teamKey}
                  onChange={(e) => setTeamKey(e.target.value)}
                  required
                  placeholder="Enter your team key"
                  className={`w-full px-4 py-3 rounded-xl pr-10 ${
                    teamName ? 'border-emerald-500/50' : keyError ? 'border-red-500/50' : ''
                  }`}
                />
                {isValidatingKey && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
                {!isValidatingKey && teamName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {!isValidatingKey && keyError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              {teamName && (
                <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                  <span>✓</span> Team: <span className="font-semibold">{teamName}</span>
                </p>
              )}
              {keyError && (
                <p className="text-sm text-red-400 mt-2">{keyError}</p>
              )}
              <p className="text-sm text-white/40 mt-2">
                Use the unique key provided to your team.
              </p>
            </div>

            {/* Challenge Selection */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Challenge</label>
              <select
                value={challengeId}
                onChange={(e) => setChallengeId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl"
              >
                <option value="factcheck">The Fact-Check Spider (Beginner)</option>
                <option value="legal">The Legal Clerk (Medium)</option>
              </select>
            </div>

            {/* API URL or File Upload */}
            {submissionType === 'api' ? (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">API Endpoint URL</label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  required
                  placeholder="https://abc123.ngrok-free.app/solve"
                  className="w-full px-4 py-3 rounded-xl"
                />
                <p className="text-sm text-white/40 mt-2">
                  Your endpoint must accept POST requests and return the expected JSON format.
                </p>
                <a 
                  href="/docs#ngrok-setup" 
                  className="text-sm text-[var(--accent-cyan)] hover:underline mt-1 inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Need help exposing your local server? See ngrok setup guide →
                </a>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Python File</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".py"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    className="w-full px-4 py-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[var(--accent-cyan)] file:text-[#0b0f2b] file:font-semibold file:cursor-pointer hover:file:bg-[#00d9c7]"
                  />
                </div>
                <p className="text-sm text-white/40 mt-2">
                  Upload a .py file with a <code className="text-[var(--accent-cyan)]">solve(query, search_api_url)</code> function.
                </p>
              </div>
            )}

            {/* Important Warning for API submissions */}
            {submissionType === 'api' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-1">⚠️ Before You Submit</h4>
                    <ul className="text-amber-300/80 text-sm space-y-1">
                      <li>✓ Double-check your URL is accessible from the internet</li>
                      <li>✓ Test it by opening the URL in your browser first</li>
                      <li>✓ <strong>Keep your server AND ngrok running</strong> for 5-10 minutes</li>
                      <li>✓ Don&apos;t close your terminal until evaluation completes</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !teamName}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Evaluating your agent...
                </span>
              ) : (
                'Submit for Evaluation'
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-4 rounded-xl ${
              result.success 
                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <p className={result.success ? 'text-emerald-400' : 'text-red-400'}>
                {result.message}
              </p>
              {result.submissionId && (
                <p className="text-sm text-white/60 mt-2">
                  Submission ID: <span className="font-mono text-[var(--accent-cyan)]">{result.submissionId}</span>
                </p>
              )}
              {result.success && submissionType === 'api' && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-300 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <strong>Keep your server running!</strong> We&apos;re evaluating your solution now.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Template / Instructions */}
        <div>
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-purple)" className="star-glow">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
              <h2 className="text-xl font-bold text-white">
                {submissionType === 'api' ? 'API Requirements' : 'Python Template'}
              </h2>
            </div>
            <p className="text-white/60 mb-6">
              {submissionType === 'api'
                ? 'Your API endpoint should accept POST requests and return the expected JSON format.'
                : 'Use this template as a starting point for your Python submission.'}
            </p>
            <CodeBlock
              code={submissionType === 'api' ? apiTemplate : pythonTemplate}
              language={submissionType === 'api' ? 'json' : 'python'}
            />
          </div>

          {/* Tips */}
          <div className="card p-8 mt-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tips for Alpha AI Datathon
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              {submissionType === 'api' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">⚡</span>
                    <span><strong className="text-amber-400">Keep your server running!</strong> Don&apos;t close ngrok or your terminal for at least 5-10 minutes after submitting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent-cyan)] mt-1">•</span>
                    <span>Test your ngrok URL in a browser before submitting</span>
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-cyan)] mt-1">•</span>
                Test with sample questions before submitting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-cyan)] mt-1">•</span>
                Include detailed reasoning in thought_process
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-cyan)] mt-1">•</span>
                Always cite the documents you retrieved
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-cyan)] mt-1">•</span>
                Handle edge cases gracefully
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen py-12" style={{ background: 'linear-gradient(180deg, #0b0f2b 0%, rgba(19, 37, 98, 1) 50%, rgba(43, 71, 176, 1) 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent-magenta)" className="star-glow">
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
            <h1 className="text-4xl md:text-5xl font-black text-white">Submit Your Agent</h1>
          </div>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Submit your RAG agent for evaluation at the <span className="text-[var(--accent-cyan)] font-semibold">Alpha AI Datathon</span>. Choose between hosting your own API endpoint or uploading a Python file.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-white/40">Loading...</div>}>
          <SubmitForm />
        </Suspense>
      </div>
    </div>
  );
}

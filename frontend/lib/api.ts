const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8006';

export interface Challenge {
  id: string;
  name: string;
  difficulty: string;
  description: string;
  theme: string;
  kb_endpoint: string;
  sample_questions: number;
  total_questions: number;
  metrics: string[];
  expected_output: {
    thought_process: string;
    retrieved_context_ids: string[];
    final_answer: string;
    citation: string;
  };
}

export interface Question {
  id: string;
  claim?: string;
  query?: string;
}

export interface SearchResult {
  doc_id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface LeaderboardEntry {
  rank: number;
  team_name: string;
  best_score: number;
  submission_count: number;
  last_submission: string;
}

export interface SubmissionResult {
  submission_id: number;
  status: string;
  message: string;
}

export interface EvaluationResult {
  submission_id: number;
  team_name: string;
  challenge_id: string;
  overall_score: number;
  retrieval_score: number;
  faithfulness_score: number;
  reasoning_score: number;
  rank?: number;
  question_results?: Array<{
    question_id: string;
    overall_score: number;
    feedback?: string;
  }>;
}

export async function getChallenges(): Promise<{ challenges: Challenge[] }> {
  const res = await fetch(`${API_BASE_URL}/api/challenges`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch challenges');
  return res.json();
}

export async function getSampleQuestions(challengeId: string): Promise<{ challenge_id: string; questions: Question[] }> {
  const res = await fetch(`${API_BASE_URL}/api/challenges/${challengeId}/sample-questions`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch sample questions');
  return res.json();
}

export async function searchKnowledgeBase(
  challengeId: string,
  query: string,
  topK: number = 5
): Promise<{ results: SearchResult[]; query: string; total_results: number }> {
  const res = await fetch(`${API_BASE_URL}/api/kb/${challengeId}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) throw new Error('Failed to search knowledge base');
  return res.json();
}

export async function submitApiEndpoint(
  teamName: string,
  challengeId: string,
  apiUrl: string
): Promise<SubmissionResult> {
  const formData = new FormData();
  formData.append('team_name', teamName);
  formData.append('challenge_id', challengeId);
  formData.append('api_url', apiUrl);

  const res = await fetch(`${API_BASE_URL}/api/submissions/api-endpoint`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to submit API endpoint');
  return res.json();
}

export async function submitPythonFile(
  teamName: string,
  challengeId: string,
  file: File
): Promise<SubmissionResult> {
  const formData = new FormData();
  formData.append('team_name', teamName);
  formData.append('challenge_id', challengeId);
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/submissions/python-file`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to submit Python file');
  return res.json();
}

export async function getSubmissionStatus(submissionId: number): Promise<{
  submission_id: number;
  team_name: string;
  challenge_id: string;
  status: string;
  created_at: string;
  completed_at?: string;
  evaluation?: {
    overall_score: number;
    retrieval_score: number;
    faithfulness_score: number;
    reasoning_score: number;
  };
}> {
  const res = await fetch(`${API_BASE_URL}/api/submissions/status/${submissionId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to get submission status');
  return res.json();
}

export async function getLeaderboard(challengeId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE_URL}/api/evaluation/leaderboard/${challengeId}?limit=${limit}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function getEvaluationResult(submissionId: number): Promise<EvaluationResult> {
  const res = await fetch(`${API_BASE_URL}/api/evaluation/results/${submissionId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch evaluation result');
  return res.json();
}


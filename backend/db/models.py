"""
Pydantic models for API requests/responses.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SearchRequest(BaseModel):
    """Request body for knowledge base search."""
    query: str = Field(..., description="The search query")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return")


class SearchResult(BaseModel):
    """A single search result from the knowledge base."""
    doc_id: str
    content: str
    score: float
    metadata: Optional[Dict[str, Any]] = None


class SearchResponse(BaseModel):
    """Response from knowledge base search."""
    results: List[SearchResult]
    query: str
    total_results: int


class AgentResponse(BaseModel):
    """Expected response format from participant agents."""
    thought_process: str = Field(..., description="Chain of thought reasoning")
    retrieved_context_ids: List[str] = Field(..., description="IDs of retrieved documents")
    final_answer: str = Field(..., description="The final answer")
    citation: str = Field(..., description="Citation for the answer")


class SubmissionRequest(BaseModel):
    """Request to submit an agent for evaluation."""
    team_name: str = Field(..., min_length=1, max_length=100)
    challenge_id: str = Field(..., pattern="^(factcheck|legal)$")
    submission_type: str = Field(..., pattern="^(api|python)$")
    api_url: Optional[str] = None
    # Python file submitted via form-data


class SubmissionResponse(BaseModel):
    """Response after submission."""
    submission_id: int
    status: str
    message: str


class EvaluationResultResponse(BaseModel):
    """Evaluation result for a submission."""
    submission_id: int
    team_name: str
    challenge_id: str
    overall_score: float
    retrieval_score: float
    faithfulness_score: float
    reasoning_score: float
    rank: Optional[int] = None
    question_results: Optional[List[Dict]] = None


class LeaderboardEntryResponse(BaseModel):
    """A leaderboard entry."""
    rank: int
    team_name: str
    best_score: float
    submission_count: int
    last_submission: datetime


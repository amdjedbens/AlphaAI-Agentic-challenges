"""
API routes for evaluation endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db, EvaluationResult, LeaderboardEntry
from db.models import EvaluationResultResponse, LeaderboardEntryResponse

router = APIRouter()


@router.get("/results/{submission_id}", response_model=EvaluationResultResponse)
async def get_evaluation_result(submission_id: int, db: Session = Depends(get_db)):
    """Get evaluation results for a specific submission."""
    result = db.query(EvaluationResult).filter(
        EvaluationResult.submission_id == submission_id
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Evaluation result not found")
    
    # Get rank
    rank = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.challenge_id == result.challenge_id,
        LeaderboardEntry.best_score > result.overall_score
    ).count() + 1
    
    return EvaluationResultResponse(
        submission_id=result.submission_id,
        team_name=result.team_name,
        challenge_id=result.challenge_id,
        overall_score=result.overall_score,
        retrieval_score=result.retrieval_score,
        faithfulness_score=result.faithfulness_score,
        reasoning_score=result.reasoning_score,
        rank=rank,
        question_results=result.question_results
    )


@router.get("/leaderboard/{challenge_id}", response_model=List[LeaderboardEntryResponse])
async def get_leaderboard(challenge_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """Get leaderboard for a specific challenge."""
    if challenge_id not in ["factcheck", "legal"]:
        raise HTTPException(status_code=400, detail="Invalid challenge ID")
    
    entries = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.challenge_id == challenge_id
    ).order_by(LeaderboardEntry.best_score.desc()).limit(limit).all()
    
    return [
        LeaderboardEntryResponse(
            rank=i + 1,
            team_name=entry.team_name,
            best_score=entry.best_score,
            submission_count=entry.submission_count,
            last_submission=entry.last_submission
        )
        for i, entry in enumerate(entries)
    ]


@router.get("/my-results/{team_name}")
async def get_team_results(team_name: str, db: Session = Depends(get_db)):
    """Get all evaluation results for a team."""
    results = db.query(EvaluationResult).filter(
        EvaluationResult.team_name == team_name
    ).order_by(EvaluationResult.created_at.desc()).all()
    
    return {
        "team_name": team_name,
        "results": [
            {
                "submission_id": r.submission_id,
                "challenge_id": r.challenge_id,
                "overall_score": r.overall_score,
                "retrieval_score": r.retrieval_score,
                "faithfulness_score": r.faithfulness_score,
                "reasoning_score": r.reasoning_score,
                "created_at": r.created_at.isoformat()
            }
            for r in results
        ]
    }


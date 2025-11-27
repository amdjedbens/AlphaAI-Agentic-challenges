"""
Public API routes - no authentication required.
Endpoints designed to be shared externally.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from db.database import get_db, LeaderboardEntry, EvaluationResult

router = APIRouter()


# Response Models
class TeamScoreResponse(BaseModel):
    """Response for team score lookup."""
    team_name: str
    factcheck_score: Optional[float] = None
    factcheck_submissions: Optional[int] = None
    legal_score: Optional[float] = None
    legal_submissions: Optional[int] = None
    total_score: float
    last_submission: Optional[datetime] = None


class LeaderboardTeamEntry(BaseModel):
    """Single entry in the leaderboard."""
    rank: int
    team_name: str
    factcheck_score: Optional[float] = None
    legal_score: Optional[float] = None
    total_score: float
    submission_count: int
    last_submission: Optional[datetime] = None


class LeaderboardResponse(BaseModel):
    """Full leaderboard response."""
    leaderboard: List[LeaderboardTeamEntry]
    total_teams: int
    last_updated: datetime


@router.get("/team/{team_name}", response_model=TeamScoreResponse)
async def get_team_score(team_name: str, db: Session = Depends(get_db)):
    """
    Get a specific team's name and scores.
    
    Returns:
        - team_name: The team name
        - factcheck_score: Best score for the factcheck challenge (if submitted)
        - legal_score: Best score for the legal challenge (if submitted)
        - total_score: Combined score across challenges
        - submission_count: Total number of submissions
    """
    # Get factcheck entry
    factcheck_entry = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.team_name == team_name,
        LeaderboardEntry.challenge_id == "factcheck"
    ).first()
    
    # Get legal entry
    legal_entry = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.team_name == team_name,
        LeaderboardEntry.challenge_id == "legal"
    ).first()
    
    if not factcheck_entry and not legal_entry:
        raise HTTPException(
            status_code=404, 
            detail=f"Team '{team_name}' not found. Make sure the team has made at least one submission."
        )
    
    # Calculate total score (average of both if available)
    scores = []
    if factcheck_entry:
        scores.append(factcheck_entry.best_score)
    if legal_entry:
        scores.append(legal_entry.best_score)
    
    total_score = sum(scores) / len(scores) if scores else 0.0
    
    # Get last submission time
    last_submission = None
    if factcheck_entry and legal_entry:
        last_submission = max(factcheck_entry.last_submission, legal_entry.last_submission)
    elif factcheck_entry:
        last_submission = factcheck_entry.last_submission
    elif legal_entry:
        last_submission = legal_entry.last_submission
    
    return TeamScoreResponse(
        team_name=team_name,
        factcheck_score=factcheck_entry.best_score if factcheck_entry else None,
        factcheck_submissions=factcheck_entry.submission_count if factcheck_entry else None,
        legal_score=legal_entry.best_score if legal_entry else None,
        legal_submissions=legal_entry.submission_count if legal_entry else None,
        total_score=round(total_score, 2),
        last_submission=last_submission
    )


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_full_leaderboard(
    challenge: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get the full leaderboard with all teams and their scores.
    
    Query Parameters:
        - challenge: Filter by challenge ('factcheck' or 'legal'). If not provided, shows combined scores.
        - limit: Maximum number of teams to return (default: 100)
    
    Returns:
        - leaderboard: List of teams with their ranks and scores
        - total_teams: Total number of teams on the leaderboard
        - last_updated: Timestamp of the most recent submission
    """
    if challenge and challenge not in ["factcheck", "legal"]:
        raise HTTPException(status_code=400, detail="Invalid challenge. Use 'factcheck' or 'legal'.")
    
    # Get all leaderboard entries
    if challenge:
        # Single challenge leaderboard
        entries = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.challenge_id == challenge
        ).order_by(LeaderboardEntry.best_score.desc()).limit(limit).all()
        
        leaderboard = [
            LeaderboardTeamEntry(
                rank=i + 1,
                team_name=entry.team_name,
                factcheck_score=entry.best_score if challenge == "factcheck" else None,
                legal_score=entry.best_score if challenge == "legal" else None,
                total_score=entry.best_score,
                submission_count=entry.submission_count,
                last_submission=entry.last_submission
            )
            for i, entry in enumerate(entries)
        ]
        
        total_teams = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.challenge_id == challenge
        ).count()
        
    else:
        # Combined leaderboard - aggregate scores across both challenges
        # Get all unique team names
        all_entries = db.query(LeaderboardEntry).all()
        
        # Group by team
        teams_data = {}
        for entry in all_entries:
            if entry.team_name not in teams_data:
                teams_data[entry.team_name] = {
                    "factcheck_score": None,
                    "legal_score": None,
                    "submission_count": 0,
                    "last_submission": None
                }
            
            if entry.challenge_id == "factcheck":
                teams_data[entry.team_name]["factcheck_score"] = entry.best_score
            elif entry.challenge_id == "legal":
                teams_data[entry.team_name]["legal_score"] = entry.best_score
            
            teams_data[entry.team_name]["submission_count"] += entry.submission_count
            
            if teams_data[entry.team_name]["last_submission"] is None:
                teams_data[entry.team_name]["last_submission"] = entry.last_submission
            else:
                teams_data[entry.team_name]["last_submission"] = max(
                    teams_data[entry.team_name]["last_submission"],
                    entry.last_submission
                )
        
        # Calculate total scores and sort
        team_list = []
        for team_name, data in teams_data.items():
            scores = []
            if data["factcheck_score"] is not None:
                scores.append(data["factcheck_score"])
            if data["legal_score"] is not None:
                scores.append(data["legal_score"])
            
            total_score = sum(scores) / len(scores) if scores else 0.0
            
            team_list.append({
                "team_name": team_name,
                "factcheck_score": data["factcheck_score"],
                "legal_score": data["legal_score"],
                "total_score": round(total_score, 2),
                "submission_count": data["submission_count"],
                "last_submission": data["last_submission"]
            })
        
        # Sort by total score descending
        team_list.sort(key=lambda x: x["total_score"], reverse=True)
        
        # Apply limit and add ranks
        leaderboard = [
            LeaderboardTeamEntry(
                rank=i + 1,
                **team_data
            )
            for i, team_data in enumerate(team_list[:limit])
        ]
        
        total_teams = len(teams_data)
    
    # Get last updated time
    last_entry = db.query(LeaderboardEntry).order_by(
        LeaderboardEntry.last_submission.desc()
    ).first()
    
    last_updated = last_entry.last_submission if last_entry else datetime.utcnow()
    
    return LeaderboardResponse(
        leaderboard=leaderboard,
        total_teams=total_teams,
        last_updated=last_updated
    )


@router.get("/teams")
async def list_all_teams(db: Session = Depends(get_db)):
    """
    Get a simple list of all teams that have made submissions.
    
    Returns:
        - teams: List of team names
        - count: Total number of teams
    """
    team_names = db.query(LeaderboardEntry.team_name).distinct().all()
    teams = sorted([t[0] for t in team_names])
    
    return {
        "teams": teams,
        "count": len(teams)
    }


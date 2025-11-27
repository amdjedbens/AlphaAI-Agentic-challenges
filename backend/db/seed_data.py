"""
Seed initial leaderboard data from aa.txt
This ensures participant data is preserved on fresh deployments.
"""
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Optional

from db.database import SessionLocal, Submission, EvaluationResult, LeaderboardEntry


# This is the EXACT data that should be in the database
# UPDATED: Include ALL competition data so it survives deployments
# CLEANED: One entry per team with their BEST score
# Last updated: 2025-11-28
INITIAL_DATA = {
    "factcheck": {
        "public": [
            {
                "teamId": 1,
                "teamName": "w-mb3d",
                "displayScore": "9.85000"
            },
            {
                "teamId": 2,
                "teamName": "itc",
                "displayScore": "7.61667"
            },
            {
                "teamId": 3,
                "teamName": "wanodevs",
                "displayScore": "2.31667"
            },
            {
                "teamId": 4,
                "teamName": "data-divas",
                "displayScore": "1.33333"
            }
        ],
        "private": [
            {
                "teamId": 1,
                "submissionId": 6,
                "rank": 1,
                "displayScore": "9.85000"
            },
            {
                "teamId": 2,
                "submissionId": 13,
                "rank": 2,
                "displayScore": "7.17500"
            },
            {
                "teamId": 3,
                "submissionId": 10,
                "rank": 3,
                "displayScore": "2.52500"
            },
            {
                "teamId": 4,
                "submissionId": 2,
                "rank": 4,
                "displayScore": "1.33333"
            }
        ]
    },
    "legal": {
        "public": [
            {
                "teamId": 1,
                "teamName": "w-mb3d",
                "displayScore": "9.35000"
            },
            {
                "teamId": 5,
                "teamName": "data-divas",
                "displayScore": "0.45000"
            }
        ],
        "private": [
            {
                "teamId": 1,
                "submissionId": 20,
                "rank": 1,
                "displayScore": "9.35000"
            },
            {
                "teamId": 5,
                "submissionId": 17,
                "rank": 2,
                "displayScore": "0.45000"
            }
        ]
    }
}

# Expected result after seeding:
# - Factcheck: w-mb3d (9.85), itc (7.61), wanodevs (2.31), data-divas (1.33)
# - Legal: data-divas (0.45)
# This data is restored on EVERY fresh deployment


def parse_score(score_str: str) -> float:
    """Parse score string to float."""
    try:
        return float(score_str)
    except (ValueError, TypeError):
        return 0.0


def seed_initial_data(db, json_data: Optional[dict] = None, force: bool = False):
    """
    Seed initial leaderboard data.
    If force=True, clears existing data and re-seeds.
    Otherwise, only seeds if no leaderboard entries exist.
    """
    # Check if database already has data
    existing_entries = db.query(LeaderboardEntry).count()
    
    if existing_entries > 0 and not force:
        # Check if we have the expected teams - if not, force re-seed
        expected_teams = ["w-mb3d", "itc", "wanodevs"]  # Top teams that should exist
        for team in expected_teams:
            exists = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.team_name == team
            ).first()
            if exists:
                print(f"ℹ️  Database already contains competition data ({team} found), skipping seed.")
                return False
        
        # Expected teams not found - force re-seed
        print("⚠️  Expected competition data not found. Forcing re-seed...")
        force = True
    
    if force and existing_entries > 0:
        print("🗑️  Clearing existing leaderboard data...")
        db.query(LeaderboardEntry).delete()
        db.query(EvaluationResult).delete()
        db.query(Submission).delete()
        db.commit()
    
    # Use provided data or default
    data = json_data or INITIAL_DATA
    
    print("🌱 Seeding initial leaderboard data...")
    seeded_count = 0
    
    for challenge_id, challenge_data in data.items():
        if challenge_id not in ["factcheck", "legal"]:
            continue
        
        public_entries = challenge_data.get("public", [])
        private_entries = challenge_data.get("private", [])
        
        # Create mapping of teamId to teamName
        team_id_to_name = {}
        for entry in public_entries:
            team_id = entry.get("teamId")
            team_name = entry.get("teamName")
            if team_id and team_name:
                team_id_to_name[team_id] = team_name
        
        # Process private entries (they have more complete info)
        for private_entry in private_entries:
            team_id = private_entry.get("teamId")
            submission_id = private_entry.get("submissionId")
            private_score = parse_score(private_entry.get("displayScore", "0.0"))
            
            if not team_id:
                continue
            
            team_name = team_id_to_name.get(team_id)
            if not team_name:
                team_name = f"team-{team_id}"
            
            # Get public score
            public_score = 0.0
            for pub_entry in public_entries:
                if pub_entry.get("teamId") == team_id:
                    public_score = parse_score(pub_entry.get("displayScore", "0.0"))
                    break
            
            # Calculate overall score
            if public_score > 0:
                overall_score = (public_score + private_score) / 2
            else:
                overall_score = private_score
            
            # Create submission
            if submission_id:
                submission = Submission(
                    id=submission_id,
                    team_name=team_name,
                    challenge_id=challenge_id,
                    submission_type="api",
                    status="completed",
                    created_at=datetime.utcnow(),
                    completed_at=datetime.utcnow()
                )
                db.add(submission)
            
            # Create evaluation result
            if submission_id:
                eval_result = EvaluationResult(
                    submission_id=submission_id,
                    team_name=team_name,
                    challenge_id=challenge_id,
                    overall_score=overall_score,
                    retrieval_score=overall_score * 0.3,
                    faithfulness_score=overall_score * 0.4,
                    reasoning_score=overall_score * 0.3,
                    public_score=public_score,
                    private_score=private_score,
                    question_results=[]
                )
                db.add(eval_result)
            
            # Create leaderboard entry
            leaderboard_entry = LeaderboardEntry(
                team_name=team_name,
                challenge_id=challenge_id,
                best_score=overall_score,
                best_public_score=public_score,
                best_private_score=private_score,
                best_submission_id=submission_id if submission_id else None,
                submission_count=1,
                last_submission=datetime.utcnow()
            )
            db.add(leaderboard_entry)
            seeded_count += 1
        
        # Handle public-only entries
        for pub_entry in public_entries:
            team_id = pub_entry.get("teamId")
            team_name = pub_entry.get("teamName")
            public_score = parse_score(pub_entry.get("displayScore", "0.0"))
            
            if not team_name:
                continue
            
            # Check if already processed
            existing = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.team_name == team_name,
                LeaderboardEntry.challenge_id == challenge_id
            ).first()
            
            if not existing:
                leaderboard_entry = LeaderboardEntry(
                    team_name=team_name,
                    challenge_id=challenge_id,
                    best_score=public_score,
                    best_public_score=public_score,
                    best_private_score=None,
                    best_submission_id=None,
                    submission_count=0,
                    last_submission=datetime.utcnow()
                )
                db.add(leaderboard_entry)
                seeded_count += 1
    
    if seeded_count > 0:
        db.commit()
        print(f"✅ Seeded {seeded_count} leaderboard entries")
        return True
    else:
        print("ℹ️  No data to seed")
        return False


def load_data_from_file(file_path: Optional[str] = None) -> Optional[dict]:
    """
    Try to load data from aa.txt file.
    Returns None if file not found or invalid.
    """
    if file_path is None:
        # Try multiple locations for aa.txt
        possible_paths = [
            # In project root (when running from backend/)
            Path(__file__).parent.parent.parent / "aa.txt",
            # In current directory
            Path("aa.txt"),
            # In /app (Docker container)
            Path("/app/aa.txt"),
            # Mounted as volume
            Path("/app/data/aa.txt"),
        ]
        
        for path in possible_paths:
            if path.exists():
                file_path = path
                break
        else:
            return None
    
    file_path = Path(file_path)
    
    if not file_path.exists():
        return None
    
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            # Remove URL if present at the start
            if content.startswith('http'):
                lines = content.split('\n', 1)
                if len(lines) > 1:
                    content = lines[1]
            
            return json.loads(content)
    except (json.JSONDecodeError, Exception) as e:
        print(f"⚠️  Could not load seed data from {file_path}: {e}")
        return None


def seed_on_startup():
    """
    Seed data on startup - called from init_db.
    Tries to load from aa.txt, falls back to INITIAL_DATA.
    """
    db = SessionLocal()
    try:
        # Try to load from file first
        json_data = load_data_from_file()
        if json_data:
            print("📂 Loaded seed data from aa.txt")
        else:
            print("📦 Using default seed data")
            json_data = INITIAL_DATA
        
        seed_initial_data(db, json_data)
    except Exception as e:
        print(f"⚠️  Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


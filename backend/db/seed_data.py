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
# From aa.txt - DO NOT modify unless you want to change initial state
INITIAL_DATA = {
    "factcheck": {
        "public": [
            {
                "teamId": 1,
                "teamName": "data-divas",
                "displayScore": "0.00000"
            }
        ],
        "private": [
            {
                "teamId": 1,
                "submissionId": 2,
                "rank": 1,
                "displayScore": "1.33333"
            }
        ]
    },
    "legal": {
        "public": [],
        "private": []
    }
}

# Expected result after seeding:
# - 1 team: "data-divas" 
# - 1 submission: id=2, factcheck challenge
# - Public score: 0.00000
# - Private score: 1.33333


def parse_score(score_str: str) -> float:
    """Parse score string to float."""
    try:
        return float(score_str)
    except (ValueError, TypeError):
        return 0.0


def seed_initial_data(db, json_data: Optional[dict] = None):
    """
    Seed initial leaderboard data if database is empty.
    Only seeds if no leaderboard entries exist.
    """
    # Check if database already has data
    existing_entries = db.query(LeaderboardEntry).count()
    if existing_entries > 0:
        print("ℹ️  Database already contains data, skipping seed.")
        return False
    
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


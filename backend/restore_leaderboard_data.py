"""
Script to restore leaderboard data from JSON backup.
This preserves participant submissions and scores.

Usage:
    python restore_leaderboard_data.py [path_to_json_file]

If no file is provided, it will look for aa.txt in the project root.
"""
import json
import sys
import os
from pathlib import Path
from datetime import datetime

# Add parent directory to path to import database models
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.database import (
    SessionLocal, 
    Submission, 
    EvaluationResult, 
    LeaderboardEntry,
    Base,
    engine
)
import asyncio

# Initialize database tables
Base.metadata.create_all(bind=engine)


def parse_score(score_str: str) -> float:
    """Parse score string to float."""
    try:
        return float(score_str)
    except (ValueError, TypeError):
        return 0.0


def restore_leaderboard_data(json_data: dict, db):
    """
    Restore leaderboard data from JSON format.
    
    Expected format:
    {
        "factcheck": {
            "public": [{"teamId": 1, "teamName": "team-name", "displayScore": "0.00000"}],
            "private": [{"teamId": 1, "submissionId": 2, "rank": 1, "displayScore": "1.33333"}]
        },
        "legal": {...}
    }
    """
    restored_count = 0
    
    for challenge_id, challenge_data in json_data.items():
        if challenge_id not in ["factcheck", "legal"]:
            print(f"⚠️  Skipping unknown challenge: {challenge_id}")
            continue
        
        print(f"\n📊 Restoring {challenge_id} challenge data...")
        
        # Process public leaderboard entries
        public_entries = challenge_data.get("public", [])
        private_entries = challenge_data.get("private", [])
        
        # Create a mapping of teamId to teamName from public entries
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
                print(f"⚠️  Skipping entry without teamId: {private_entry}")
                continue
            
            # Get team name from mapping or use a default
            team_name = team_id_to_name.get(team_id)
            if not team_name:
                # Try to find existing team in database
                existing_entry = db.query(LeaderboardEntry).filter(
                    LeaderboardEntry.challenge_id == challenge_id
                ).first()
                if existing_entry:
                    team_name = existing_entry.team_name
                else:
                    team_name = f"team-{team_id}"
                    print(f"⚠️  No team name found for teamId {team_id}, using: {team_name}")
            
            # Get public score for this team
            public_score = 0.0
            for pub_entry in public_entries:
                if pub_entry.get("teamId") == team_id:
                    public_score = parse_score(pub_entry.get("displayScore", "0.0"))
                    break
            
            # Calculate overall score (average of public and private, or use private if public is 0)
            if public_score > 0:
                overall_score = (public_score + private_score) / 2
            else:
                overall_score = private_score
            
            print(f"  📝 Team: {team_name}")
            print(f"     Public Score: {public_score:.5f}")
            print(f"     Private Score: {private_score:.5f}")
            print(f"     Overall Score: {overall_score:.5f}")
            
            # Create or update submission
            if submission_id:
                submission = db.query(Submission).filter(
                    Submission.id == submission_id
                ).first()
                
                if not submission:
                    submission = Submission(
                        id=submission_id,
                        team_name=team_name,
                        challenge_id=challenge_id,
                        submission_type="api",  # Default, adjust if needed
                        status="completed",
                        created_at=datetime.utcnow(),
                        completed_at=datetime.utcnow()
                    )
                    db.add(submission)
                    print(f"     ✅ Created submission {submission_id}")
                else:
                    print(f"     ℹ️  Submission {submission_id} already exists")
            
            # Create or update evaluation result
            if submission_id:
                eval_result = db.query(EvaluationResult).filter(
                    EvaluationResult.submission_id == submission_id
                ).first()
                
                if not eval_result:
                    eval_result = EvaluationResult(
                        submission_id=submission_id,
                        team_name=team_name,
                        challenge_id=challenge_id,
                        overall_score=overall_score,
                        retrieval_score=overall_score * 0.3,  # Estimate
                        faithfulness_score=overall_score * 0.4,  # Estimate
                        reasoning_score=overall_score * 0.3,  # Estimate
                        public_score=public_score,
                        private_score=private_score,
                        question_results=[]  # Empty, as we don't have detailed results
                    )
                    db.add(eval_result)
                    print(f"     ✅ Created evaluation result for submission {submission_id}")
                else:
                    # Update scores
                    eval_result.overall_score = overall_score
                    eval_result.public_score = public_score
                    eval_result.private_score = private_score
                    print(f"     ✅ Updated evaluation result for submission {submission_id}")
            
            # Create or update leaderboard entry
            leaderboard_entry = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.team_name == team_name,
                LeaderboardEntry.challenge_id == challenge_id
            ).first()
            
            if not leaderboard_entry:
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
                print(f"     ✅ Created leaderboard entry")
                restored_count += 1
            else:
                # Update if this is a better score
                if overall_score > leaderboard_entry.best_score:
                    leaderboard_entry.best_score = overall_score
                if public_score > (leaderboard_entry.best_public_score or 0):
                    leaderboard_entry.best_public_score = public_score
                if private_score > (leaderboard_entry.best_private_score or 0):
                    leaderboard_entry.best_private_score = private_score
                if submission_id:
                    leaderboard_entry.best_submission_id = submission_id
                print(f"     ✅ Updated leaderboard entry")
                restored_count += 1
        
        # Also handle public-only entries (teams with only public scores)
        for pub_entry in public_entries:
            team_id = pub_entry.get("teamId")
            team_name = pub_entry.get("teamName")
            public_score = parse_score(pub_entry.get("displayScore", "0.0"))
            
            if not team_name:
                continue
            
            # Check if we already processed this team from private entries
            existing = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.team_name == team_name,
                LeaderboardEntry.challenge_id == challenge_id
            ).first()
            
            if not existing:
                # Create leaderboard entry with only public score
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
                print(f"  📝 Team: {team_name} (public only, score: {public_score:.5f})")
                print(f"     ✅ Created leaderboard entry")
                restored_count += 1
    
    return restored_count


def main():
    """Main function to restore data."""
    print("=" * 60)
    print("🔄 Leaderboard Data Restoration Script")
    print("=" * 60)
    
    # Determine JSON file path
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    else:
        # Look for aa.txt in project root
        project_root = Path(__file__).parent.parent
        json_file = project_root / "aa.txt"
    
    if not os.path.exists(json_file):
        print(f"❌ Error: JSON file not found: {json_file}")
        print("\nUsage: python restore_leaderboard_data.py [path_to_json_file]")
        sys.exit(1)
    
    print(f"📂 Reading data from: {json_file}")
    
    # Read JSON data
    try:
        with open(json_file, 'r') as f:
            content = f.read()
            # Remove URL if present at the start
            if content.startswith('http'):
                lines = content.split('\n', 1)
                if len(lines) > 1:
                    content = lines[1]
            
            json_data = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        sys.exit(1)
    
    # Connect to database
    db = SessionLocal()
    
    try:
        # Restore data
        restored_count = restore_leaderboard_data(json_data, db)
        
        # Commit all changes
        db.commit()
        
        print("\n" + "=" * 60)
        print(f"✅ Successfully restored {restored_count} leaderboard entries!")
        print("=" * 60)
        print("\n📊 Verification:")
        
        # Verify restoration
        for challenge_id in ["factcheck", "legal"]:
            entries = db.query(LeaderboardEntry).filter(
                LeaderboardEntry.challenge_id == challenge_id
            ).all()
            print(f"  {challenge_id}: {len(entries)} entries")
            for entry in entries:
                print(f"    - {entry.team_name}: public={entry.best_public_score or 0:.5f}, "
                      f"private={entry.best_private_score or 0:.5f}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during restoration: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()


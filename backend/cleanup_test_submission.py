"""
Script to remove test submissions from the database.
Run this on the server where the database is located.

Usage: python cleanup_test_submission.py
"""
import sqlite3
import os
from pathlib import Path

# Use the same database directory as the main app
DB_DIR = os.getenv("DB_DIR", "/app/db")
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(DB_DIR, "challenges.db"))

def cleanup_team_submissions(team_name: str):
    """Remove all submissions and related data for a team."""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print(f"🔍 Looking for submissions from team: {team_name}")
    
    # First, show what we're going to delete
    cursor.execute("SELECT id, challenge_id, status, created_at FROM submissions WHERE team_name = ?", (team_name,))
    submissions = cursor.fetchall()
    
    if not submissions:
        print(f"❌ No submissions found for team '{team_name}'")
        conn.close()
        return
    
    print(f"\n📋 Found {len(submissions)} submission(s):")
    for sub in submissions:
        print(f"   - ID: {sub[0]}, Challenge: {sub[1]}, Status: {sub[2]}, Created: {sub[3]}")
    
    # Delete from evaluation_results
    cursor.execute("DELETE FROM evaluation_results WHERE team_name = ?", (team_name,))
    eval_deleted = cursor.rowcount
    print(f"\n🗑️  Deleted {eval_deleted} evaluation result(s)")
    
    # Delete from leaderboard
    cursor.execute("DELETE FROM leaderboard WHERE team_name = ?", (team_name,))
    leaderboard_deleted = cursor.rowcount
    print(f"🗑️  Deleted {leaderboard_deleted} leaderboard entry(s)")
    
    # Delete from submissions
    cursor.execute("DELETE FROM submissions WHERE team_name = ?", (team_name,))
    submissions_deleted = cursor.rowcount
    print(f"🗑️  Deleted {submissions_deleted} submission(s)")
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Successfully cleaned up all data for team '{team_name}'")


if __name__ == "__main__":
    # Team to clean up
    TEAM_NAME = "bianconeri"
    
    print("=" * 50)
    print("🧹 Test Submission Cleanup Script")
    print("=" * 50)
    
    cleanup_team_submissions(TEAM_NAME)


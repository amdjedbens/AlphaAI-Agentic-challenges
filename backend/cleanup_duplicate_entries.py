"""
Cleanup duplicate leaderboard entries.
Removes entries with submissionId=0 or duplicate team entries.

Run this on the server:
    docker compose exec backend python cleanup_duplicate_entries.py
"""
import os
from pathlib import Path

# Setup DB path
DB_DIR = os.getenv("DB_DIR", "/app/db")
DB_PATH = os.path.join(DB_DIR, "challenges.db")

# Fallback for local development
if not os.path.exists(DB_PATH):
    DB_PATH = "./challenges.db"

import sqlite3

def cleanup_duplicates():
    """Remove duplicate and invalid leaderboard entries."""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("🔍 Current leaderboard entries:")
    cursor.execute("""
        SELECT id, team_name, challenge_id, best_score, best_public_score, 
               best_private_score, best_submission_id, submission_count 
        FROM leaderboard
    """)
    entries = cursor.fetchall()
    
    for entry in entries:
        print(f"   ID={entry[0]}, Team={entry[1]}, Challenge={entry[2]}")
        print(f"      Public={entry[4]}, Private={entry[5]}, SubmissionID={entry[6]}, Count={entry[7]}")
    
    print(f"\n📊 Total entries: {len(entries)}")
    
    # Find entries to delete:
    # 1. Entries with submissionId=0 or NULL (invalid)
    # 2. Duplicate team entries (keep the one with highest private score)
    
    # Delete entries with submissionId=0 or NULL
    cursor.execute("""
        DELETE FROM leaderboard 
        WHERE best_submission_id IS NULL OR best_submission_id = 0
    """)
    deleted_invalid = cursor.rowcount
    print(f"\n🗑️  Deleted {deleted_invalid} entries with invalid submission_id")
    
    # Also clean up related evaluation results
    cursor.execute("""
        DELETE FROM evaluation_results 
        WHERE submission_id IS NULL OR submission_id = 0
    """)
    deleted_eval = cursor.rowcount
    print(f"🗑️  Deleted {deleted_eval} related evaluation results")
    
    # Clean up submissions with id=0
    cursor.execute("""
        DELETE FROM submissions 
        WHERE id = 0
    """)
    deleted_sub = cursor.rowcount
    print(f"🗑️  Deleted {deleted_sub} submissions with id=0")
    
    conn.commit()
    
    # Show remaining entries
    print("\n✅ Remaining leaderboard entries:")
    cursor.execute("""
        SELECT id, team_name, challenge_id, best_public_score, best_private_score, best_submission_id
        FROM leaderboard
    """)
    remaining = cursor.fetchall()
    
    for entry in remaining:
        print(f"   ID={entry[0]}, Team={entry[1]}, Challenge={entry[2]}")
        print(f"      Public={entry[3]}, Private={entry[4]}, SubmissionID={entry[5]}")
    
    print(f"\n📊 Total remaining: {len(remaining)}")
    
    conn.close()
    print("\n✅ Cleanup complete!")


if __name__ == "__main__":
    print("=" * 50)
    print("🧹 Duplicate Entry Cleanup Script")
    print("=" * 50)
    cleanup_duplicates()


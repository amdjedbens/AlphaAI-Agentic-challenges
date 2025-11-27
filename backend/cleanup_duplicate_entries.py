"""
Reset database to match aa.txt initial state.
Removes ALL entries except the expected seed data.

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

def show_current_state(cursor):
    """Display current database state."""
    print("\n📊 LEADERBOARD:")
    cursor.execute("""
        SELECT id, team_name, challenge_id, best_public_score, 
               best_private_score, best_submission_id 
        FROM leaderboard ORDER BY id
    """)
    for row in cursor.fetchall():
        print(f"   ID={row[0]}, Team={row[1]}, Challenge={row[2]}, "
              f"Public={row[3]}, Private={row[4]}, SubID={row[5]}")
    
    print("\n📊 SUBMISSIONS:")
    cursor.execute("SELECT id, team_name, challenge_id, status FROM submissions ORDER BY id")
    for row in cursor.fetchall():
        print(f"   ID={row[0]}, Team={row[1]}, Challenge={row[2]}, Status={row[3]}")
    
    print("\n📊 EVALUATION RESULTS:")
    cursor.execute("""
        SELECT id, submission_id, team_name, public_score, private_score 
        FROM evaluation_results ORDER BY id
    """)
    for row in cursor.fetchall():
        print(f"   ID={row[0]}, SubID={row[1]}, Team={row[2]}, "
              f"Public={row[3]}, Private={row[4]}")


def reset_to_initial():
    """Reset database to only contain aa.txt data."""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("🔍 CURRENT STATE:")
    show_current_state(cursor)
    
    # Expected state from aa.txt:
    # - 1 team: data-divas
    # - submission_id: 2
    # - public_score: 0.00000
    # - private_score: 1.33333
    
    print("\n" + "=" * 50)
    print("🗑️  CLEANING UP...")
    print("=" * 50)
    
    # Delete ALL leaderboard entries except the correct one
    cursor.execute("""
        DELETE FROM leaderboard 
        WHERE NOT (team_name = 'data-divas' AND best_submission_id = 2)
    """)
    print(f"   Deleted {cursor.rowcount} extra leaderboard entries")
    
    # Delete ALL evaluation results except the correct one
    cursor.execute("""
        DELETE FROM evaluation_results 
        WHERE submission_id != 2
    """)
    print(f"   Deleted {cursor.rowcount} extra evaluation results")
    
    # Delete ALL submissions except id=2
    cursor.execute("""
        DELETE FROM submissions 
        WHERE id != 2
    """)
    print(f"   Deleted {cursor.rowcount} extra submissions")
    
    # Verify data-divas entry exists with correct scores
    cursor.execute("""
        SELECT id FROM leaderboard 
        WHERE team_name = 'data-divas' AND challenge_id = 'factcheck'
    """)
    if not cursor.fetchone():
        print("\n⚠️  data-divas entry missing! Creating...")
        cursor.execute("""
            INSERT INTO leaderboard 
            (team_name, challenge_id, best_score, best_public_score, 
             best_private_score, best_submission_id, submission_count)
            VALUES ('data-divas', 'factcheck', 1.33333, 0.0, 1.33333, 2, 1)
        """)
    
    # Verify submission id=2 exists
    cursor.execute("SELECT id FROM submissions WHERE id = 2")
    if not cursor.fetchone():
        print("\n⚠️  Submission id=2 missing! Creating...")
        cursor.execute("""
            INSERT INTO submissions 
            (id, team_name, challenge_id, submission_type, status)
            VALUES (2, 'data-divas', 'factcheck', 'api', 'completed')
        """)
    
    # Verify evaluation result exists
    cursor.execute("SELECT id FROM evaluation_results WHERE submission_id = 2")
    if not cursor.fetchone():
        print("\n⚠️  Evaluation result missing! Creating...")
        cursor.execute("""
            INSERT INTO evaluation_results 
            (submission_id, team_name, challenge_id, overall_score, 
             retrieval_score, faithfulness_score, reasoning_score,
             public_score, private_score, question_results)
            VALUES (2, 'data-divas', 'factcheck', 1.33333, 0.4, 0.53, 0.4, 
                    0.0, 1.33333, '[]')
        """)
    
    conn.commit()
    
    print("\n" + "=" * 50)
    print("✅ FINAL STATE (should match aa.txt):")
    print("=" * 50)
    show_current_state(cursor)
    
    conn.close()
    print("\n✅ Reset complete! Database now matches aa.txt")


if __name__ == "__main__":
    print("=" * 60)
    print("🔄 DATABASE RESET TO aa.txt STATE")
    print("=" * 60)
    print("\n⚠️  This will DELETE all entries except:")
    print("   - Team: data-divas")
    print("   - Submission ID: 2")  
    print("   - Public Score: 0.00000")
    print("   - Private Score: 1.33333")
    print("")
    
    response = input("Type 'RESET' to proceed: ")
    if response == "RESET":
        reset_to_initial()
    else:
        print("❌ Cancelled. No changes made.")


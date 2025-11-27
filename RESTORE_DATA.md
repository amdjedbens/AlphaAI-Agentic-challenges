# Quick Guide: Restore Participant Data

## 🚨 If You Lost Data After Redeploy

Don't panic! You can restore participant submissions and scores.

## Quick Restore from JSON

If you have leaderboard data in JSON format (like `aa.txt`):

```bash
# Option 1: Run from host (if database is accessible)
cd backend
python restore_leaderboard_data.py ../aa.txt

# Option 2: Run inside Docker container
docker compose exec backend python restore_leaderboard_data.py

# Option 3: Run with custom JSON file
docker compose exec backend python restore_leaderboard_data.py /path/to/your/data.json
```

## What Gets Restored

The script will recreate:
- ✅ **Submissions** - All submission records
- ✅ **Evaluation Results** - Scores (public, private, overall)
- ✅ **Leaderboard Entries** - Team rankings and best scores

## JSON Format Expected

```json
{
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
```

## Verify Restoration

After running the script, verify the data:

```bash
# Check leaderboard entries
docker compose exec backend python -c "
from backend.db.database import SessionLocal, LeaderboardEntry
db = SessionLocal()
entries = db.query(LeaderboardEntry).all()
for e in entries:
    print(f'{e.team_name} - {e.challenge_id}: public={e.best_public_score}, private={e.best_private_score}')
db.close()
"
```

## ⚠️ Important Notes

1. **The script is idempotent** - Running it multiple times is safe (it updates existing entries)
2. **It preserves existing data** - Only adds/updates, doesn't delete
3. **Scores are preserved** - Both public and private scores are restored
4. **Submission IDs** - If submission IDs are provided, they're used; otherwise auto-generated

## Troubleshooting

### "Database file not found"
Make sure the database volume is mounted and the container is running:
```bash
docker compose ps
docker compose exec backend ls -la /app/db/
```

### "Invalid JSON format"
Check your JSON file is valid:
```bash
python -m json.tool aa.txt > /dev/null
```

### "No data restored"
- Check the JSON file has the correct structure
- Verify team names match
- Check the script output for warnings

## Next Steps

After restoring:
1. ✅ Verify data in the UI
2. ✅ Test a new submission to ensure everything works
3. ✅ Set up automated backups (see `DATABASE_PERSISTENCE.md`)


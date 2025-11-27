# Automatic Data Seeding

## ✅ What Happens on Startup

When the backend starts up, it automatically:

1. **Creates database tables** (if they don't exist)
2. **Checks if database is empty**
3. **Seeds initial data** from `aa.txt` (if file exists) or uses hardcoded default data
4. **Only seeds if database is empty** - won't overwrite existing data

## 📊 Initial Data

The system seeds the following data on first startup:

- **Team**: `data-divas`
- **Challenge**: `factcheck`
- **Public Score**: `0.00000`
- **Private Score**: `1.33333`
- **Submission ID**: `2`

## 🔄 How It Works

1. **On startup**, `init_db()` is called
2. **Checks for existing data** - if leaderboard entries exist, skips seeding
3. **Tries to load from `aa.txt`**:
   - Looks in project root: `./aa.txt`
   - Looks in Docker container: `/app/aa.txt`
   - Falls back to hardcoded `INITIAL_DATA` in `seed_data.py`
4. **Creates records**:
   - Submission record
   - Evaluation result (with public/private scores)
   - Leaderboard entry

## 📁 File Locations

The seed data is loaded from:
- **Primary**: `aa.txt` in project root (mounted as volume)
- **Fallback**: Hardcoded in `backend/db/seed_data.py` as `INITIAL_DATA`

## 🚀 Usage

### Automatic (Default)
Just start the application - seeding happens automatically:

```bash
docker compose up -d
```

### Manual Seed
If you need to re-seed (only works if database is empty):

```bash
docker compose exec backend python -c "from db.seed_data import seed_on_startup; seed_on_startup()"
```

### Update Seed Data
1. Edit `aa.txt` with new data
2. Restart the container:
   ```bash
   docker compose restart backend
   ```
3. **Note**: Seeding only happens if database is empty. To force re-seed, you'd need to clear the database first.

## ⚠️ Important Notes

1. **Idempotent**: Seeding only happens if database is empty
2. **Safe**: Won't overwrite existing participant data
3. **Automatic**: No manual intervention needed
4. **Persistent**: Once seeded, data persists in the Docker volume

## 🔍 Verify Seeding

Check if data was seeded:

```bash
# Check leaderboard entries
docker compose exec backend python -c "
from db.database import SessionLocal, LeaderboardEntry
db = SessionLocal()
entries = db.query(LeaderboardEntry).all()
print(f'Found {len(entries)} leaderboard entries:')
for e in entries:
    print(f'  - {e.team_name} ({e.challenge_id}): public={e.best_public_score}, private={e.best_private_score}')
db.close()
"
```

## 📝 Customizing Seed Data

To change the initial seed data:

1. **Option 1**: Edit `aa.txt` (recommended)
   - Update the JSON structure
   - Restart container (only seeds if DB is empty)

2. **Option 2**: Edit `backend/db/seed_data.py`
   - Modify the `INITIAL_DATA` dictionary
   - Rebuild container

## 🆘 Troubleshooting

### Data not seeding
- Check if database already has data (seeding is skipped if not empty)
- Check logs: `docker compose logs backend | grep -i seed`
- Verify `aa.txt` exists and is valid JSON

### File not found
- The system falls back to hardcoded data automatically
- Check that `aa.txt` is in project root
- Verify volume mount in `docker-compose.yml`

### Want to re-seed
If you need to re-seed (database already has data):

```bash
# ⚠️ WARNING: This deletes all data!
docker compose exec backend python -c "
from db.database import SessionLocal, LeaderboardEntry, Submission, EvaluationResult
db = SessionLocal()
db.query(EvaluationResult).delete()
db.query(LeaderboardEntry).delete()
db.query(Submission).delete()
db.commit()
db.close()
print('Database cleared')
"

# Then restart to seed
docker compose restart backend
```


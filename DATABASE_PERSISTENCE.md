# Database Persistence Guide

## 🔒 Problem Solved

Previously, the database was stored inside the container, which meant **all data was lost on redeploy**. This has been fixed by:

1. **Using a persistent Docker volume** for the database directory (`/app/db`)
2. **Mounting the volume properly** (directories, not files)
3. **Automatic directory creation** on startup

## ✅ Current Setup

The database is now stored in a **Docker named volume** (`backend_db`) that persists across:
- Container restarts
- Container recreations
- Docker Compose down/up cycles
- Code deployments

**Location**: `/app/db/challenges.db` inside the container  
**Volume**: `backend_db` (managed by Docker)

## 📦 Why SQLite (Not JSON)?

SQLite is actually the **right choice** for this use case:

✅ **Advantages:**
- ACID transactions (data integrity)
- Concurrent read access
- SQL queries (leaderboard, filtering, etc.)
- Built-in indexing for performance
- No separate database server needed
- Perfect for small-to-medium applications

❌ **JSON files would be problematic:**
- No transactions (data corruption risk)
- Race conditions with concurrent writes
- Manual locking needed
- No query capabilities
- Slower for large datasets

## 🔄 Migration from Old Setup

If you had data before this fix, you can restore it:

### Option 1: Restore from JSON Leaderboard Data
If you have leaderboard data in JSON format (like `aa.txt`):

```bash
# From project root
cd backend
python restore_leaderboard_data.py ../aa.txt

# Or from inside container
docker compose exec backend python restore_leaderboard_data.py
```

This will recreate:
- Submission records
- Evaluation results (with public/private scores)
- Leaderboard entries

### Option 2: Restore from Database Backup
If you have a backup of `challenges.db`:

```bash
# Copy backup into the volume
docker run --rm \
  -v alpha-ai-challenges_backend_db:/data \
  -v $(pwd):/backup \
  alpine \
  cp /backup/challenges.db /data/challenges.db
```

### Option 3: Fresh Start
Just redeploy with the new configuration - the database will be empty but will persist going forward.

## 💾 Backup & Recovery

### Create Backup

```bash
# Backup the entire database directory
docker run --rm \
  -v alpha-ai-challenges_backend_db:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/db-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# Or backup just the database file
docker run --rm \
  -v alpha-ai-challenges_backend_db:/data \
  -v $(pwd):/backup \
  alpine \
  cp /data/challenges.db /backup/challenges.db
```

### Restore from Backup

```bash
# Restore from tar.gz backup
docker run --rm \
  -v alpha-ai-challenges_backend_db:/data \
  -v $(pwd):/backup \
  alpine \
  sh -c "cd /data && rm -f challenges.db* && tar xzf /backup/db-backup-YYYYMMDD-HHMMSS.tar.gz"

# Or restore from single file
docker run --rm \
  -v alpha-ai-challenges_backend_db:/data \
  -v $(pwd):/backup \
  alpine \
  cp /backup/challenges.db /data/challenges.db
```

### Automated Backup Script

Create `backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

docker run --rm \
  -v alpha-ai-challenges_backend_db:/data \
  -v $(pwd)/$BACKUP_DIR:/backup \
  alpine \
  tar czf /backup/db-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

echo "✅ Backup created in $BACKUP_DIR"
```

Run daily via cron:
```bash
0 2 * * * /path/to/backup-db.sh  # 2 AM daily
```

## 🚨 Important Notes

### Volume Location
Docker volumes are stored in Docker's data directory:
- **Linux**: `/var/lib/docker/volumes/`
- **macOS/Windows**: Inside Docker Desktop VM

### Volume Name
The volume name is prefixed with your project directory name:
- Project: `alpha-ai-challenges`
- Volume: `alpha-ai-challenges_backend_db`

To find it:
```bash
docker volume ls | grep backend_db
```

### Never Delete the Volume!
```bash
# ❌ DON'T DO THIS (unless you want to lose all data)
docker volume rm alpha-ai-challenges_backend_db

# ✅ Safe: Stop containers without deleting volume
docker compose down  # Keeps volumes
docker compose down -v  # ⚠️ Removes volumes (data loss!)
```

## 🔍 Verify Persistence

After redeploying, verify the database persists:

```bash
# 1. Check volume exists
docker volume ls | grep backend_db

# 2. Inspect volume
docker volume inspect alpha-ai-challenges_backend_db

# 3. Check database file exists
docker compose exec backend ls -la /app/db/

# 4. Query database
docker compose exec backend python -c "
from backend.db.database import SessionLocal
from backend.db.database import Submission
db = SessionLocal()
count = db.query(Submission).count()
print(f'Total submissions: {count}')
db.close()
"
```

## 🆘 Troubleshooting

### Database Not Persisting
1. Check volume is mounted: `docker compose exec backend ls -la /app/db/`
2. Verify volume exists: `docker volume ls`
3. Check docker-compose.yml has the volume mount

### Permission Issues
If you see permission errors:
```bash
docker compose exec backend chmod 755 /app/db
docker compose exec backend chown -R $(id -u):$(id -g) /app/db
```

### Database Corrupted
If the database gets corrupted:
```bash
# Stop containers
docker compose down

# Restore from backup (see above)
# Or recreate volume (⚠️ data loss)
docker volume rm alpha-ai-challenges_backend_db
docker compose up -d
```

## 📊 Monitoring

Check database size:
```bash
docker compose exec backend du -h /app/db/challenges.db
```

View recent submissions:
```bash
docker compose exec backend python -c "
from backend.db.database import SessionLocal, Submission
from sqlalchemy import desc
db = SessionLocal()
recent = db.query(Submission).order_by(desc(Submission.created_at)).limit(5).all()
for s in recent:
    print(f'{s.id}: {s.team_name} - {s.challenge_id} - {s.status}')
db.close()
"
```

## 🎯 Best Practices

1. **Regular Backups**: Set up automated daily backups
2. **Test Restores**: Periodically test restoring from backup
3. **Monitor Size**: SQLite can handle GBs, but monitor growth
4. **Version Control**: Never commit the database file
5. **Document Changes**: Log any schema changes

## 🔮 Future: PostgreSQL Migration

If you outgrow SQLite (unlikely for a challenge platform), consider PostgreSQL:

**When to migrate:**
- Database > 10GB
- Need concurrent writes > 100/sec
- Need advanced features (full-text search, JSON queries, etc.)

**Migration path:**
1. Export SQLite data
2. Create PostgreSQL schema
3. Import data
4. Update `DATABASE_URL` to PostgreSQL connection string
5. Update docker-compose to use PostgreSQL service

But for now, **SQLite is perfect** for your use case! 🎉


#!/bin/bash
# Database Backup Script
# Creates a timestamped backup of the database volume

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="db-backup-${TIMESTAMP}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Get volume name (assumes standard naming convention)
VOLUME_NAME=$(docker volume ls | grep backend_db | awk '{print $2}' | head -1)

if [ -z "$VOLUME_NAME" ]; then
    echo "❌ Error: Could not find backend_db volume"
    echo "   Make sure Docker containers are running: docker compose ps"
    exit 1
fi

echo "📦 Creating backup of volume: $VOLUME_NAME"
echo "   Destination: $BACKUP_DIR/$BACKUP_FILE"

# Create backup
docker run --rm \
  -v "$VOLUME_NAME":/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine \
  tar czf "/backup/$BACKUP_FILE" -C /data .

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "✅ Backup created successfully!"
    echo "   File: $BACKUP_DIR/$BACKUP_FILE"
    echo "   Size: $BACKUP_SIZE"
    
    # List recent backups
    echo ""
    echo "📋 Recent backups:"
    ls -lh "$BACKUP_DIR"/db-backup-*.tar.gz 2>/dev/null | tail -5 | awk '{print "   " $9 " (" $5 ")"}'
else
    echo "❌ Backup failed!"
    exit 1
fi


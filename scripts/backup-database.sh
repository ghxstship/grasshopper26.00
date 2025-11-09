#!/bin/bash

################################################################################
# Database Backup Script for GVTEWAY
# 
# This script creates automated backups of the Supabase database and uploads
# them to S3 for redundancy. It should be run via cron or GitHub Actions.
#
# Usage:
#   ./scripts/backup-database.sh
#
# Environment Variables Required:
#   - DATABASE_URL: Full Supabase database connection string
#   - AWS_ACCESS_KEY_ID: AWS access key (optional, for S3 upload)
#   - AWS_SECRET_ACCESS_KEY: AWS secret key (optional, for S3 upload)
#   - S3_BUCKET: S3 bucket name (optional, default: gvteway-db-backups)
#
# Exit Codes:
#   0 - Success
#   1 - Missing required environment variables
#   2 - Backup failed
#   3 - Upload failed
################################################################################

set -euo pipefail

# Configuration
PROJECT_REF="nhceygmzwmhuyqsjxquk"
BACKUP_DIR="${BACKUP_DIR:-./backups/supabase}"
S3_BUCKET="${S3_BUCKET:-gvteway-db-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check required environment variables
check_requirements() {
    if [ -z "${DATABASE_URL:-}" ]; then
        error "DATABASE_URL environment variable is not set"
        error "Please set it to your Supabase database connection string"
        exit 1
    fi
    
    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump is not installed. Please install PostgreSQL client tools."
        exit 1
    fi
    
    log "✓ Requirements check passed"
}

# Create backup directory
setup_directories() {
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/daily"
    mkdir -p "$BACKUP_DIR/weekly"
    mkdir -p "$BACKUP_DIR/monthly"
    log "✓ Backup directories created"
}

# Generate backup filename with timestamp
generate_filename() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local day_of_week=$(date +%u)
    local day_of_month=$(date +%d)
    
    # Determine backup type
    if [ "$day_of_month" = "01" ]; then
        echo "monthly/backup_monthly_${timestamp}.sql"
    elif [ "$day_of_week" = "1" ]; then
        echo "weekly/backup_weekly_${timestamp}.sql"
    else
        echo "daily/backup_daily_${timestamp}.sql"
    fi
}

# Create database backup
create_backup() {
    local backup_file="$1"
    local full_path="$BACKUP_DIR/$backup_file"
    
    log "Starting database backup..."
    log "Backup file: $full_path"
    
    # Create backup using pg_dump
    if pg_dump "$DATABASE_URL" \
        --format=plain \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        > "$full_path" 2>> "$LOG_FILE"; then
        
        log "✓ Database dump completed"
        
        # Get backup size
        local size=$(du -h "$full_path" | cut -f1)
        log "Backup size: $size"
        
        # Compress backup
        log "Compressing backup..."
        if gzip -f "$full_path"; then
            log "✓ Backup compressed: ${full_path}.gz"
            echo "${full_path}.gz"
        else
            error "Failed to compress backup"
            exit 2
        fi
    else
        error "Database backup failed"
        exit 2
    fi
}

# Upload backup to S3
upload_to_s3() {
    local backup_file="$1"
    
    # Check if AWS credentials are set
    if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
        warn "AWS credentials not set. Skipping S3 upload."
        return 0
    fi
    
    # Check if AWS CLI is available
    if ! command -v aws &> /dev/null; then
        warn "AWS CLI is not installed. Skipping S3 upload."
        return 0
    fi
    
    log "Uploading backup to S3..."
    
    local filename=$(basename "$backup_file")
    local s3_path="s3://${S3_BUCKET}/backups/$(date +%Y/%m)/${filename}"
    
    if aws s3 cp "$backup_file" "$s3_path" \
        --storage-class STANDARD \
        --server-side-encryption AES256 \
        2>> "$LOG_FILE"; then
        
        log "✓ Backup uploaded to S3: $s3_path"
        
        # Set lifecycle policy if not already set
        set_s3_lifecycle
    else
        error "Failed to upload backup to S3"
        exit 3
    fi
}

# Set S3 lifecycle policy
set_s3_lifecycle() {
    local lifecycle_config=$(cat <<EOF
{
    "Rules": [
        {
            "Id": "TransitionToGlacier",
            "Status": "Enabled",
            "Prefix": "backups/",
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "GLACIER"
                }
            ],
            "Expiration": {
                "Days": 90
            }
        }
    ]
}
EOF
)
    
    # Only set if not already configured
    if ! aws s3api get-bucket-lifecycle-configuration --bucket "$S3_BUCKET" &> /dev/null; then
        log "Setting S3 lifecycle policy..."
        echo "$lifecycle_config" | aws s3api put-bucket-lifecycle-configuration \
            --bucket "$S3_BUCKET" \
            --lifecycle-configuration file:///dev/stdin \
            2>> "$LOG_FILE" || warn "Failed to set lifecycle policy"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Clean daily backups older than retention period
    find "$BACKUP_DIR/daily" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>> "$LOG_FILE" || true
    
    # Keep weekly backups for 90 days
    find "$BACKUP_DIR/weekly" -name "backup_*.sql.gz" -mtime +90 -delete 2>> "$LOG_FILE" || true
    
    # Keep monthly backups for 1 year
    find "$BACKUP_DIR/monthly" -name "backup_*.sql.gz" -mtime +365 -delete 2>> "$LOG_FILE" || true
    
    log "✓ Old backups cleaned up"
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    log "Verifying backup integrity..."
    
    # Check if file exists and is not empty
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    if [ ! -s "$backup_file" ]; then
        error "Backup file is empty: $backup_file"
        return 1
    fi
    
    # Check gzip integrity
    if gzip -t "$backup_file" 2>> "$LOG_FILE"; then
        log "✓ Backup integrity verified"
        return 0
    else
        error "Backup file is corrupted"
        return 1
    fi
}

# Send notification (placeholder for future implementation)
send_notification() {
    local status="$1"
    local message="$2"
    
    # TODO: Implement Slack/email notifications
    # For now, just log
    if [ "$status" = "success" ]; then
        log "NOTIFICATION: $message"
    else
        error "NOTIFICATION: $message"
    fi
}

# Main execution
main() {
    log "=========================================="
    log "Starting database backup process"
    log "=========================================="
    
    # Check requirements
    check_requirements
    
    # Setup directories
    setup_directories
    
    # Generate backup filename
    local backup_file=$(generate_filename)
    
    # Create backup
    local compressed_backup=$(create_backup "$backup_file")
    
    # Verify backup
    if verify_backup "$compressed_backup"; then
        # Upload to S3
        upload_to_s3 "$compressed_backup"
        
        # Clean up old backups
        cleanup_old_backups
        
        log "=========================================="
        log "✓ Backup completed successfully"
        log "Backup location: $compressed_backup"
        log "=========================================="
        
        send_notification "success" "Database backup completed successfully"
        exit 0
    else
        error "Backup verification failed"
        send_notification "failure" "Database backup verification failed"
        exit 2
    fi
}

# Run main function
main "$@"

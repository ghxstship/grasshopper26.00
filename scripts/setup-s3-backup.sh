#!/bin/bash

################################################################################
# S3 Backup Bucket Setup Script for GVTEWAY
# 
# This script creates and configures the S3 bucket for database backups
# using AWS CLI commands. Alternative to Terraform for simpler setup.
#
# Prerequisites:
#   - AWS CLI installed and configured
#   - Appropriate AWS permissions (S3, IAM)
#
# Usage:
#   ./scripts/setup-s3-backup.sh
#
# Exit Codes:
#   0 - Success
#   1 - Missing prerequisites
#   2 - AWS CLI error
################################################################################

set -euo pipefail

# Configuration
BUCKET_NAME="gvteway-db-backups"
LOGS_BUCKET_NAME="gvteway-db-backups-logs"
IAM_USER_NAME="gvteway-backup-service"
REGION="us-east-1"
EMAIL_ALERT="support@gvteway.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
        error "Install from: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured"
        error "Run: aws configure"
        exit 1
    fi
    
    log "✓ Prerequisites check passed"
}

# Create main backup bucket
create_backup_bucket() {
    log "Creating S3 backup bucket: $BUCKET_NAME"
    
    # Check if bucket already exists
    if aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
        warn "Bucket $BUCKET_NAME already exists, skipping creation"
        return 0
    fi
    
    # Create bucket
    if [ "$REGION" = "us-east-1" ]; then
        aws s3api create-bucket \
            --bucket "$BUCKET_NAME" \
            --region "$REGION"
    else
        aws s3api create-bucket \
            --bucket "$BUCKET_NAME" \
            --region "$REGION" \
            --create-bucket-configuration LocationConstraint="$REGION"
    fi
    
    log "✓ Bucket created: $BUCKET_NAME"
}

# Enable versioning
enable_versioning() {
    log "Enabling versioning on $BUCKET_NAME"
    
    aws s3api put-bucket-versioning \
        --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled
    
    log "✓ Versioning enabled"
}

# Enable encryption
enable_encryption() {
    log "Enabling server-side encryption on $BUCKET_NAME"
    
    aws s3api put-bucket-encryption \
        --bucket "$BUCKET_NAME" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                },
                "BucketKeyEnabled": true
            }]
        }'
    
    log "✓ Encryption enabled (AES256)"
}

# Block public access
block_public_access() {
    log "Blocking all public access to $BUCKET_NAME"
    
    aws s3api put-public-access-block \
        --bucket "$BUCKET_NAME" \
        --public-access-block-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    
    log "✓ Public access blocked"
}

# Set lifecycle policy
set_lifecycle_policy() {
    log "Setting lifecycle policy on $BUCKET_NAME"
    
    # Create temporary lifecycle policy file
    cat > /tmp/lifecycle-policy.json <<EOF
{
    "Rules": [
        {
            "Id": "daily-backups-lifecycle",
            "Status": "Enabled",
            "Prefix": "backups/daily/",
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "GLACIER"
                }
            ],
            "Expiration": {
                "Days": 90
            },
            "NoncurrentVersionTransitions": [
                {
                    "NoncurrentDays": 30,
                    "StorageClass": "GLACIER"
                }
            ],
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 90
            }
        },
        {
            "Id": "weekly-backups-lifecycle",
            "Status": "Enabled",
            "Prefix": "backups/weekly/",
            "Transitions": [
                {
                    "Days": 60,
                    "StorageClass": "GLACIER"
                }
            ],
            "Expiration": {
                "Days": 180
            }
        },
        {
            "Id": "monthly-backups-lifecycle",
            "Status": "Enabled",
            "Prefix": "backups/monthly/",
            "Transitions": [
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                }
            ],
            "Expiration": {
                "Days": 365
            }
        },
        {
            "Id": "logs-lifecycle",
            "Status": "Enabled",
            "Prefix": "logs/",
            "Expiration": {
                "Days": 30
            }
        },
        {
            "Id": "cleanup-incomplete-uploads",
            "Status": "Enabled",
            "AbortIncompleteMultipartUpload": {
                "DaysAfterInitiation": 7
            }
        }
    ]
}
EOF
    
    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$BUCKET_NAME" \
        --lifecycle-configuration file:///tmp/lifecycle-policy.json
    
    rm /tmp/lifecycle-policy.json
    
    log "✓ Lifecycle policy configured"
}

# Create logs bucket (optional)
create_logs_bucket() {
    log "Creating logs bucket: $LOGS_BUCKET_NAME"
    
    # Check if bucket already exists
    if aws s3 ls "s3://$LOGS_BUCKET_NAME" 2>/dev/null; then
        warn "Logs bucket already exists, skipping creation"
        return 0
    fi
    
    # Create bucket
    if [ "$REGION" = "us-east-1" ]; then
        aws s3api create-bucket \
            --bucket "$LOGS_BUCKET_NAME" \
            --region "$REGION"
    else
        aws s3api create-bucket \
            --bucket "$LOGS_BUCKET_NAME" \
            --region "$REGION" \
            --create-bucket-configuration LocationConstraint="$REGION"
    fi
    
    log "✓ Logs bucket created: $LOGS_BUCKET_NAME"
}

# Enable bucket logging
enable_logging() {
    log "Enabling access logging for $BUCKET_NAME"
    
    aws s3api put-bucket-logging \
        --bucket "$BUCKET_NAME" \
        --bucket-logging-status '{
            "LoggingEnabled": {
                "TargetBucket": "'"$LOGS_BUCKET_NAME"'",
                "TargetPrefix": "backup-access-logs/"
            }
        }'
    
    log "✓ Access logging enabled"
}

# Create IAM user
create_iam_user() {
    log "Creating IAM user: $IAM_USER_NAME"
    
    # Check if user already exists
    if aws iam get-user --user-name "$IAM_USER_NAME" &> /dev/null; then
        warn "IAM user already exists, skipping creation"
        return 0
    fi
    
    aws iam create-user \
        --user-name "$IAM_USER_NAME" \
        --tags Key=Name,Value="GVTEWAY Backup Service" \
               Key=Purpose,Value="Automated Database Backups"
    
    log "✓ IAM user created: $IAM_USER_NAME"
}

# Attach IAM policy
attach_iam_policy() {
    log "Attaching IAM policy to $IAM_USER_NAME"
    
    # Create temporary policy file
    cat > /tmp/backup-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject",
                "s3:GetObjectVersion",
                "s3:ListBucketVersions"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME",
                "arn:aws:s3:::$BUCKET_NAME/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListAllMyBuckets"
            ],
            "Resource": "*"
        }
    ]
}
EOF
    
    aws iam put-user-policy \
        --user-name "$IAM_USER_NAME" \
        --policy-name "BackupServicePolicy" \
        --policy-document file:///tmp/backup-policy.json
    
    rm /tmp/backup-policy.json
    
    log "✓ IAM policy attached"
}

# Create access key
create_access_key() {
    log "Creating access key for $IAM_USER_NAME"
    
    # Check if access key already exists
    local existing_keys=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --query 'AccessKeyMetadata[].AccessKeyId' --output text)
    
    if [ -n "$existing_keys" ]; then
        warn "Access key already exists for $IAM_USER_NAME"
        info "Existing Access Key ID: $existing_keys"
        info "If you need a new key, delete the old one first:"
        info "  aws iam delete-access-key --user-name $IAM_USER_NAME --access-key-id <KEY_ID>"
        return 0
    fi
    
    # Create new access key
    local key_output=$(aws iam create-access-key --user-name "$IAM_USER_NAME")
    
    local access_key_id=$(echo "$key_output" | grep -o '"AccessKeyId": "[^"]*' | cut -d'"' -f4)
    local secret_access_key=$(echo "$key_output" | grep -o '"SecretAccessKey": "[^"]*' | cut -d'"' -f4)
    
    log "✓ Access key created"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}🔑 IAM CREDENTIALS (SAVE THESE SECURELY)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${YELLOW}Access Key ID:${NC}"
    echo "$access_key_id"
    echo ""
    echo -e "${YELLOW}Secret Access Key:${NC}"
    echo "$secret_access_key"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    warn "⚠️  IMPORTANT: Save these credentials now!"
    warn "⚠️  The Secret Access Key cannot be retrieved again."
    echo ""
    info "Add these to GitHub Secrets:"
    info "  1. Go to: Repository Settings → Secrets → Actions"
    info "  2. Add secret: AWS_ACCESS_KEY_ID = $access_key_id"
    info "  3. Add secret: AWS_SECRET_ACCESS_KEY = <secret from above>"
    info "  4. Add secret: S3_BACKUP_BUCKET = $BUCKET_NAME"
    echo ""
}

# Add bucket tags
add_bucket_tags() {
    log "Adding tags to $BUCKET_NAME"
    
    aws s3api put-bucket-tagging \
        --bucket "$BUCKET_NAME" \
        --tagging 'TagSet=[
            {Key=Name,Value="GVTEWAY Database Backups"},
            {Key=Project,Value="Grasshopper26.00"},
            {Key=Environment,Value="Production"},
            {Key=Purpose,Value="Database Backups"},
            {Key=ManagedBy,Value="AWS CLI"}
        ]'
    
    log "✓ Tags added"
}

# Verify setup
verify_setup() {
    log "Verifying S3 bucket setup..."
    
    # Check bucket exists
    if ! aws s3 ls "s3://$BUCKET_NAME" &> /dev/null; then
        error "Bucket verification failed: $BUCKET_NAME not found"
        exit 2
    fi
    
    # Check versioning
    local versioning=$(aws s3api get-bucket-versioning --bucket "$BUCKET_NAME" --query 'Status' --output text)
    if [ "$versioning" != "Enabled" ]; then
        warn "Versioning is not enabled"
    fi
    
    # Check encryption
    if ! aws s3api get-bucket-encryption --bucket "$BUCKET_NAME" &> /dev/null; then
        warn "Encryption is not configured"
    fi
    
    # Check public access block
    local public_block=$(aws s3api get-public-access-block --bucket "$BUCKET_NAME" --query 'PublicAccessBlockConfiguration.BlockPublicAcls' --output text)
    if [ "$public_block" != "True" ]; then
        warn "Public access is not fully blocked"
    fi
    
    log "✓ Verification complete"
}

# Print summary
print_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ S3 BACKUP BUCKET SETUP COMPLETE${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${BLUE}Bucket Configuration:${NC}"
    echo "  • Bucket Name: $BUCKET_NAME"
    echo "  • Region: $REGION"
    echo "  • Versioning: Enabled"
    echo "  • Encryption: AES256"
    echo "  • Public Access: Blocked"
    echo "  • Lifecycle Policy: Configured"
    echo ""
    echo -e "${BLUE}IAM Configuration:${NC}"
    echo "  • User: $IAM_USER_NAME"
    echo "  • Policy: BackupServicePolicy"
    echo "  • Access Key: Created (see above)"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Add AWS credentials to GitHub Secrets"
    echo "  2. Test backup script: ./scripts/backup-database.sh"
    echo "  3. Verify backup in S3: aws s3 ls s3://$BUCKET_NAME/backups/"
    echo "  4. Enable GitHub Actions workflow"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "  • Backup Strategy: docs/database/BACKUP_STRATEGY.md"
    echo "  • Remediation Guide: docs/database/DATABASE_SCHEMA_FINAL_REMEDIATION.md"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}GVTEWAY S3 Backup Bucket Setup${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Create and configure bucket
    create_backup_bucket
    enable_versioning
    enable_encryption
    block_public_access
    set_lifecycle_policy
    add_bucket_tags
    
    # Create logs bucket (optional)
    create_logs_bucket
    enable_logging
    
    # Create IAM user and credentials
    create_iam_user
    attach_iam_policy
    create_access_key
    
    # Verify setup
    verify_setup
    
    # Print summary
    print_summary
}

# Run main function
main "$@"

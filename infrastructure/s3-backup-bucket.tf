# GVTEWAY Database Backup S3 Bucket Configuration
# This Terraform configuration creates and configures the S3 bucket for database backups
# 
# Prerequisites:
# - AWS CLI configured with appropriate credentials
# - Terraform installed (version >= 1.0)
# 
# Usage:
#   terraform init
#   terraform plan
#   terraform apply

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "GVTEWAY"
      Environment = "Production"
      ManagedBy   = "Terraform"
      Purpose     = "Database Backups"
    }
  }
}

# S3 Bucket for Database Backups
resource "aws_s3_bucket" "database_backups" {
  bucket = "gvteway-db-backups"
  
  tags = {
    Name        = "GVTEWAY Database Backups"
    Description = "Automated database backups for Supabase PostgreSQL"
  }
}

# Enable Versioning
resource "aws_s3_bucket_versioning" "database_backups" {
  bucket = aws_s3_bucket.database_backups.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Server-Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "database_backups" {
  bucket = aws_s3_bucket.database_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Block All Public Access
resource "aws_s3_bucket_public_access_block" "database_backups" {
  bucket = aws_s3_bucket.database_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "database_backups" {
  bucket = aws_s3_bucket.database_backups.id

  # Daily backups: Standard → Glacier → Delete
  rule {
    id     = "daily-backups-lifecycle"
    status = "Enabled"

    filter {
      prefix = "backups/daily/"
    }

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = 90
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  # Weekly backups: Keep longer
  rule {
    id     = "weekly-backups-lifecycle"
    status = "Enabled"

    filter {
      prefix = "backups/weekly/"
    }

    transition {
      days          = 60
      storage_class = "GLACIER"
    }

    expiration {
      days = 180
    }
  }

  # Monthly backups: Keep longest
  rule {
    id     = "monthly-backups-lifecycle"
    status = "Enabled"

    filter {
      prefix = "backups/monthly/"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }

  # Logs: Delete after 30 days
  rule {
    id     = "logs-lifecycle"
    status = "Enabled"

    filter {
      prefix = "logs/"
    }

    expiration {
      days = 30
    }
  }

  # Incomplete multipart uploads: Clean up after 7 days
  rule {
    id     = "cleanup-incomplete-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Bucket Logging (optional but recommended)
resource "aws_s3_bucket" "backup_logs" {
  bucket = "gvteway-db-backups-logs"
  
  tags = {
    Name        = "GVTEWAY Backup Logs"
    Description = "Access logs for database backup bucket"
  }
}

resource "aws_s3_bucket_logging" "database_backups" {
  bucket = aws_s3_bucket.database_backups.id

  target_bucket = aws_s3_bucket.backup_logs.id
  target_prefix = "backup-access-logs/"
}

# IAM User for Backup Service
resource "aws_iam_user" "backup_service" {
  name = "gvteway-backup-service"
  path = "/service-accounts/"

  tags = {
    Name        = "GVTEWAY Backup Service"
    Description = "Service account for automated database backups"
  }
}

# IAM Policy for Backup Service
resource "aws_iam_user_policy" "backup_service" {
  name = "BackupServicePolicy"
  user = aws_iam_user.backup_service.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject",
          "s3:GetObjectVersion",
          "s3:ListBucketVersions"
        ]
        Resource = [
          aws_s3_bucket.database_backups.arn,
          "${aws_s3_bucket.database_backups.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetBucketLocation",
          "s3:ListAllMyBuckets"
        ]
        Resource = "*"
      }
    ]
  })
}

# Create Access Key for Backup Service
resource "aws_iam_access_key" "backup_service" {
  user = aws_iam_user.backup_service.name
}

# CloudWatch Alarm for Backup Failures
resource "aws_cloudwatch_metric_alarm" "backup_failure" {
  alarm_name          = "gvteway-backup-failure"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "NumberOfObjects"
  namespace           = "AWS/S3"
  period              = "86400"  # 24 hours
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "Alert when no new backups are created in 24 hours"
  treat_missing_data  = "breaching"

  dimensions = {
    BucketName = aws_s3_bucket.database_backups.id
    StorageType = "AllStorageTypes"
  }

  alarm_actions = [aws_sns_topic.backup_alerts.arn]
}

# SNS Topic for Backup Alerts
resource "aws_sns_topic" "backup_alerts" {
  name = "gvteway-backup-alerts"
  
  tags = {
    Name        = "GVTEWAY Backup Alerts"
    Description = "SNS topic for database backup alerts"
  }
}

# SNS Topic Subscription (Email)
resource "aws_sns_topic_subscription" "backup_alerts_email" {
  topic_arn = aws_sns_topic.backup_alerts.arn
  protocol  = "email"
  endpoint  = "support@gvteway.com"
}

# S3 Bucket Metric for Monitoring
resource "aws_s3_bucket_metric" "database_backups" {
  bucket = aws_s3_bucket.database_backups.id
  name   = "EntireBucket"
}

# Outputs
output "bucket_name" {
  description = "Name of the S3 backup bucket"
  value       = aws_s3_bucket.database_backups.id
}

output "bucket_arn" {
  description = "ARN of the S3 backup bucket"
  value       = aws_s3_bucket.database_backups.arn
}

output "bucket_region" {
  description = "Region of the S3 backup bucket"
  value       = aws_s3_bucket.database_backups.region
}

output "iam_user_name" {
  description = "Name of the IAM user for backup service"
  value       = aws_iam_user.backup_service.name
}

output "iam_access_key_id" {
  description = "Access Key ID for backup service (SENSITIVE)"
  value       = aws_iam_access_key.backup_service.id
  sensitive   = true
}

output "iam_secret_access_key" {
  description = "Secret Access Key for backup service (SENSITIVE)"
  value       = aws_iam_access_key.backup_service.secret
  sensitive   = true
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for backup alerts"
  value       = aws_sns_topic.backup_alerts.arn
}

# Instructions for retrieving sensitive outputs
output "instructions" {
  description = "Instructions for retrieving sensitive credentials"
  value = <<-EOT
    To retrieve the IAM credentials for GitHub Secrets:
    
    1. Access Key ID:
       terraform output -raw iam_access_key_id
    
    2. Secret Access Key:
       terraform output -raw iam_secret_access_key
    
    Add these to GitHub Secrets:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    - S3_BACKUP_BUCKET = ${aws_s3_bucket.database_backups.id}
  EOT
}

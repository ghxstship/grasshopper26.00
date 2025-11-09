#!/bin/bash
# Instant rollback script for production emergencies

set -e

echo "🔴 INITIATING INSTANT ROLLBACK"
echo "================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Get current deployment
echo "Fetching current deployment..."
CURRENT_DEPLOYMENT=$(vercel ls --prod --token=$VERCEL_TOKEN | head -2 | tail -1 | awk '{print $1}')
echo "Current deployment: $CURRENT_DEPLOYMENT"

# Get previous deployment
PREVIOUS_DEPLOYMENT=$(vercel ls --prod --token=$VERCEL_TOKEN | head -3 | tail -1 | awk '{print $1}')
echo "Previous deployment: $PREVIOUS_DEPLOYMENT"

# Confirm rollback
read -p "⚠️  Rollback to $PREVIOUS_DEPLOYMENT? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled"
  exit 1
fi

# Execute rollback
echo "Rolling back..."
vercel rollback $PREVIOUS_DEPLOYMENT --token=$VERCEL_TOKEN

# Verify rollback
echo "Waiting for rollback to complete..."
sleep 10

NEW_DEPLOYMENT=$(vercel ls --prod --token=$VERCEL_TOKEN | head -2 | tail -1 | awk '{print $1}')

if [ "$NEW_DEPLOYMENT" == "$PREVIOUS_DEPLOYMENT" ]; then
  echo "✅ Rollback successful"
  
  # Health check
  echo "Running health check..."
  HEALTH_STATUS=$(curl -s https://gvteway.com/api/health | jq -r .status)
  
  if [ "$HEALTH_STATUS" == "healthy" ]; then
    echo "✅ Health check passed"
  else
    echo "⚠️  Health check status: $HEALTH_STATUS"
  fi
  
  # Notify team (if Slack webhook is configured)
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST $SLACK_WEBHOOK_URL \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"🔴 Production rolled back from $CURRENT_DEPLOYMENT to $PREVIOUS_DEPLOYMENT\"}"
  fi
else
  echo "❌ Rollback failed"
  exit 1
fi

echo ""
echo "================================"
echo "Rollback complete!"
echo "Please monitor production closely and investigate the root cause."

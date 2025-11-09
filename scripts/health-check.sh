#!/bin/bash
# Health check script for monitoring deployments

set -e

# Default values
ENDPOINT="${1:-https://gvteway.com/api/health}"
MAX_RETRIES="${2:-3}"
RETRY_DELAY="${3:-5}"

echo "🔍 Health Check"
echo "================================"
echo "Endpoint: $ENDPOINT"
echo "Max retries: $MAX_RETRIES"
echo ""

attempt=1
while [ $attempt -le $MAX_RETRIES ]; do
  echo "Attempt $attempt/$MAX_RETRIES..."
  
  # Make request and capture response
  RESPONSE=$(curl -s -w "\n%{http_code}" "$ENDPOINT")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  echo "HTTP Status: $HTTP_CODE"
  
  if [ "$HTTP_CODE" == "200" ]; then
    # Parse JSON response
    STATUS=$(echo "$BODY" | jq -r .status)
    TIMESTAMP=$(echo "$BODY" | jq -r .timestamp)
    VERSION=$(echo "$BODY" | jq -r .version)
    
    echo "Status: $STATUS"
    echo "Version: $VERSION"
    echo "Timestamp: $TIMESTAMP"
    echo ""
    echo "Service Health:"
    echo "$BODY" | jq -r '.checks[] | "  \(.service): \(.status) (\(.latency)ms)"'
    
    if [ "$STATUS" == "healthy" ]; then
      echo ""
      echo "✅ Health check passed"
      exit 0
    else
      echo ""
      echo "⚠️  System is $STATUS"
      
      if [ $attempt -lt $MAX_RETRIES ]; then
        echo "Retrying in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
      fi
    fi
  else
    echo "❌ Health check failed with HTTP $HTTP_CODE"
    
    if [ $attempt -lt $MAX_RETRIES ]; then
      echo "Retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
    fi
  fi
  
  attempt=$((attempt + 1))
done

echo ""
echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1

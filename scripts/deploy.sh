#!/bin/bash

# Grasshopper Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e  # Exit on error

ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment to $ENVIRONMENT..."
echo "📅 Timestamp: $TIMESTAMP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed. Aborting."; exit 1; }

print_status "Environment validated"

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -f .env.production ]; then
        export $(cat .env.production | xargs)
        print_status "Loaded production environment variables"
    else
        print_error ".env.production file not found"
        exit 1
    fi
else
    if [ -f .env.staging ]; then
        export $(cat .env.staging | xargs)
        print_status "Loaded staging environment variables"
    else
        print_warning ".env.staging file not found, using defaults"
    fi
fi

# Run pre-deployment checks
echo ""
echo "🔍 Running pre-deployment checks..."

# Check if git is clean (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    if [[ -n $(git status -s) ]]; then
        print_error "Git working directory is not clean. Commit or stash changes before deploying to production."
        exit 1
    fi
    print_status "Git working directory is clean"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci --production=false
print_status "Dependencies installed"

# Run linting
echo ""
echo "🔍 Running linter..."
npm run lint || {
    print_error "Linting failed"
    exit 1
}
print_status "Linting passed"

# Run type checking
echo ""
echo "🔍 Running type check..."
npm run type-check || {
    print_error "Type checking failed"
    exit 1
}
print_status "Type checking passed"

# Run tests
echo ""
echo "🧪 Running tests..."
npm run test:unit || {
    print_error "Tests failed"
    exit 1
}
print_status "Tests passed"

# Build application
echo ""
echo "🏗️  Building application..."
npm run build || {
    print_error "Build failed"
    exit 1
}
print_status "Build completed"

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
if [ "$ENVIRONMENT" = "production" ]; then
    print_warning "Production database migration - proceed with caution"
    read -p "Continue with production migration? (yes/no) " -n 3 -r
    echo
    if [[ ! $REPLY =~ ^yes$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

npx supabase db push || {
    print_error "Database migration failed"
    exit 1
}
print_status "Database migrations completed"

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod --yes || {
        print_error "Vercel deployment failed"
        exit 1
    }
else
    vercel --yes || {
        print_error "Vercel deployment failed"
        exit 1
    }
fi
print_status "Deployment to Vercel completed"

# Run post-deployment checks
echo ""
echo "🔍 Running post-deployment checks..."

# Health check
HEALTH_CHECK_URL="${NEXT_PUBLIC_APP_URL}/api/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL")

if [ "$HTTP_STATUS" = "200" ]; then
    print_status "Health check passed"
else
    print_error "Health check failed (HTTP $HTTP_STATUS)"
    exit 1
fi

# Warm up cache
echo ""
echo "🔥 Warming up cache..."
curl -s "$NEXT_PUBLIC_APP_URL" > /dev/null
curl -s "$NEXT_PUBLIC_APP_URL/api/v1/events" > /dev/null
print_status "Cache warmed up"

# Tag deployment (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo "🏷️  Tagging deployment..."
    git tag -a "deploy-$TIMESTAMP" -m "Production deployment $TIMESTAMP"
    git push origin "deploy-$TIMESTAMP"
    print_status "Deployment tagged"
fi

# Send notification
echo ""
echo "📢 Sending deployment notification..."
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✅ Deployment to $ENVIRONMENT completed successfully at $TIMESTAMP\"}" \
        > /dev/null 2>&1
    print_status "Slack notification sent"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════"
echo -e "${GREEN}✓ Deployment to $ENVIRONMENT completed successfully!${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo "📊 Deployment Summary:"
echo "   Environment: $ENVIRONMENT"
echo "   Timestamp: $TIMESTAMP"
echo "   URL: $NEXT_PUBLIC_APP_URL"
echo ""
echo "🎉 All done!"

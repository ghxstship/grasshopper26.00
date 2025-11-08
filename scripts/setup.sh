#!/bin/bash

# Grasshopper 26.00 Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🎉 Grasshopper 26.00 Setup Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Check for .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local and add your API keys${NC}"
    echo ""
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
    echo ""
fi

# Step 3: Generate VAPID keys for push notifications
echo "🔑 Step 3: Generating VAPID keys for push notifications..."
if command -v npx &> /dev/null; then
    echo ""
    echo "Run this command to generate VAPID keys:"
    echo -e "${YELLOW}npx web-push generate-vapid-keys${NC}"
    echo ""
    echo "Then add the keys to your .env.local file:"
    echo "  NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key>"
    echo "  VAPID_PRIVATE_KEY=<private_key>"
    echo ""
fi

# Step 4: Database setup instructions
echo "🗄️  Step 4: Database Setup"
echo "To set up your database, run:"
echo -e "${YELLOW}npm run db:migrate${NC}"
echo ""
echo "To generate TypeScript types, run:"
echo -e "${YELLOW}npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts${NC}"
echo ""

# Step 5: Development server
echo "🚀 Step 5: Start Development Server"
echo "To start the development server, run:"
echo -e "${YELLOW}npm run dev${NC}"
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Generate VAPID keys (see above)"
echo "3. Run database migrations"
echo "4. Generate TypeScript types"
echo "5. Start the dev server"
echo ""
echo "For deployment instructions, see:"
echo "  - README.md"
echo "  - PRODUCTION_DEPLOYMENT_GUIDE.md"
echo ""
echo "🎊 Happy coding!"

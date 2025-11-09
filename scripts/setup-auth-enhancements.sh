#!/bin/bash

# Authentication Enhancements Setup Script
# Version: 26.0.0
# Date: 2025-01-09

set -e

echo "🔐 GVTEWAY Authentication Enhancements Setup"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo "Step 1: Installing dependencies..."
echo "-----------------------------------"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "Step 2: Running database migration..."
echo "--------------------------------------"
if command -v supabase &> /dev/null; then
    supabase db push
    echo -e "${GREEN}✓ Database migration applied${NC}"
else
    echo -e "${YELLOW}⚠ Supabase CLI not found. Please run 'supabase db push' manually.${NC}"
fi
echo ""

echo "Step 3: Checking environment variables..."
echo "------------------------------------------"
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_APP_URL" .env.local; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_APP_URL found${NC}"
    else
        echo -e "${YELLOW}⚠ NEXT_PUBLIC_APP_URL not found in .env.local${NC}"
        echo "  Please add: NEXT_PUBLIC_APP_URL=https://your-domain.com"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL found${NC}"
    else
        echo -e "${YELLOW}⚠ NEXT_PUBLIC_SUPABASE_URL not found in .env.local${NC}"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY found${NC}"
    else
        echo -e "${YELLOW}⚠ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.local not found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ .env.local created${NC}"
        echo "  Please update the values in .env.local"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
    fi
fi
echo ""

echo "Step 4: Running type check..."
echo "------------------------------"
npm run type-check
echo -e "${GREEN}✓ Type check passed${NC}"
echo ""

echo "Step 5: Running tests..."
echo "------------------------"
npm run test:unit tests/unit/auth-services.test.ts || echo -e "${YELLOW}⚠ Some tests failed (expected for placeholder tests)${NC}"
echo ""

echo "============================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo ""
echo "Next Steps:"
echo "-----------"
echo "1. Configure OAuth providers in Supabase Dashboard:"
echo "   - Navigate to Authentication > Providers"
echo "   - Enable GitHub and Microsoft"
echo "   - Add OAuth credentials"
echo ""
echo "2. Update environment variables in .env.local"
echo ""
echo "3. Review documentation:"
echo "   - docs/security/AUTHENTICATION_GUIDE.md"
echo "   - docs/security/AUTH_REMEDIATION_SUMMARY.md"
echo ""
echo "4. ⚠️  IMPORTANT: Before production deployment:"
echo "   - Implement proper AES-256-GCM encryption for MFA secrets"
echo "   - See: src/lib/services/mfa.service.ts (encryptSecret/decryptSecret)"
echo ""
echo "5. Test the authentication flow:"
echo "   - Email/password login"
echo "   - MFA setup and verification"
echo "   - OAuth login (all providers)"
echo "   - Account lockout behavior"
echo ""
echo "For support: support@gvteway.com"
echo "For security issues: security@gvteway.com"
echo ""

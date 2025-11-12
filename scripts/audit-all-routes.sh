#!/bin/bash

# Comprehensive Route Audit Script
# Tests all routes in the application

BASE_URL="http://app.localhost:3000"
FAILED=0
PASSED=0
TOTAL=0

echo "================================================"
echo "COMPREHENSIVE ROUTE AUDIT"
echo "================================================"
echo ""

# Function to test a route
test_route() {
  local route=$1
  local description=$2
  
  ((TOTAL++))
  
  echo -n "[$TOTAL] Testing $description... "
  
  status=$(curl -sI "$BASE_URL$route" 2>/dev/null | grep "^HTTP" | awk '{print $2}')
  
  if [ -z "$status" ]; then
    echo "✗ FAIL (No response)"
    ((FAILED++))
    return
  fi
  
  if [ "$status" = "200" ] || [ "$status" = "307" ] || [ "$status" = "302" ]; then
    echo "✓ PASS (HTTP $status)"
    ((PASSED++))
  elif [ "$status" = "404" ]; then
    echo "✗ FAIL (HTTP 404 - Not Found)"
    ((FAILED++))
  elif [ "$status" = "500" ]; then
    echo "✗ FAIL (HTTP 500 - Server Error)"
    ((FAILED++))
  else
    echo "⚠ WARN (HTTP $status)"
    ((PASSED++))
  fi
}

# ================================================
# LEGEND ROUTES (Platform Admin)
# ================================================
echo "LEGEND ROUTES (Platform Admin)"
echo "-------------------------------"
test_route "/legend" "Legend root"
test_route "/legend/dashboard" "Legend dashboard"
test_route "/legend/organizations" "Organizations list"
test_route "/legend/organizations/new" "New organization"
test_route "/legend/venues" "Venues list"
test_route "/legend/vendors" "Vendors list"
test_route "/legend/staff" "Staff list"
test_route "/legend/membership/companion-passes" "Companion passes"
echo ""

# ================================================
# ORGANIZATION ROUTES (Org Admin)
# ================================================
echo "ORGANIZATION ROUTES (Org Admin)"
echo "--------------------------------"
test_route "/organization" "Organization root"
test_route "/organization/dashboard" "Organization dashboard"
test_route "/organization/events" "Events list"
test_route "/organization/events/create" "Create event"
test_route "/organization/events/new" "New event"
test_route "/organization/orders" "Orders list"
test_route "/organization/products" "Products list"
test_route "/organization/products/new" "New product"
test_route "/organization/users" "Users list"
test_route "/organization/inventory" "Inventory"
test_route "/organization/advances" "Advances list"
test_route "/organization/roles" "Roles & permissions"
test_route "/organization/settings" "Settings"
test_route "/organization/reports" "Reports"
test_route "/organization/bulk-operations" "Bulk operations"
test_route "/organization/contracts" "Contracts"
test_route "/organization/equipment" "Equipment"
test_route "/organization/budgets" "Budgets"
test_route "/organization/tasks" "Tasks"
test_route "/organization/artists" "Artists"
test_route "/organization/artists/create" "Create artist"
test_route "/organization/brands" "Brands"
test_route "/organization/marketing/campaigns" "Marketing campaigns"
test_route "/organization/tickets/dynamic-pricing" "Dynamic pricing"
test_route "/organization/permissions-test" "Permissions test"
test_route "/organization/credentials/check-in" "Credentials check-in"
echo ""

# ================================================
# TEAM ROUTES (Event Staff)
# ================================================
echo "TEAM ROUTES (Event Staff)"
echo "-------------------------"
test_route "/team" "Team root"
test_route "/team/dashboard" "Team dashboard"
test_route "/team/scanner" "Ticket scanner"
test_route "/team/scanner?eventId=test-123" "Scanner with eventId"
test_route "/team/issues" "Issue reporting"
test_route "/team/issues?eventId=test-123" "Issues with eventId"
test_route "/team/notes" "Quick notes"
test_route "/team/notes?eventId=test-123" "Notes with eventId"
echo ""

# ================================================
# MEMBER ROUTES (Members)
# ================================================
echo "MEMBER ROUTES (Members)"
echo "-----------------------"
test_route "/member" "Member root"
test_route "/member/dashboard" "Member dashboard"
test_route "/member/orders" "Orders"
test_route "/member/credits" "Credits"
test_route "/member/favorites" "Favorites"
test_route "/member/referrals" "Referrals"
test_route "/member/schedule" "Schedule"
test_route "/member/vouchers" "Vouchers"
test_route "/member/cart" "Cart"
test_route "/member/checkout" "Checkout"
test_route "/member/checkout/success" "Checkout success"
test_route "/member/advances" "Advances"
test_route "/member/advances/catalog" "Advances catalog"
test_route "/member/advances/checkout" "Advances checkout"
test_route "/member/membership/checkout" "Membership checkout"
test_route "/member/profile/orders" "Profile orders"
echo ""

# ================================================
# PUBLIC ROUTES
# ================================================
echo "PUBLIC ROUTES"
echo "-------------"
test_route "/events" "Events"
test_route "/shop" "Shop"
test_route "/music" "Music"
test_route "/news" "News"
test_route "/adventures" "Adventures"
test_route "/membership" "Membership"
echo ""

# ================================================
# AUTH ROUTES
# ================================================
echo "AUTH ROUTES"
echo "-----------"
test_route "/login" "Login"
test_route "/signup" "Signup"
test_route "/forgot-password" "Forgot password"
test_route "/reset-password" "Reset password"
test_route "/verify-email" "Verify email"
test_route "/onboarding" "Onboarding"
test_route "/profile" "Profile"
echo ""

# ================================================
# RESULTS
# ================================================
echo "================================================"
echo "AUDIT RESULTS"
echo "================================================"
echo "  Total Routes Tested: $TOTAL"
echo "  Passed: $PASSED"
echo "  Failed: $FAILED"
echo "  Success Rate: $(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")%"
echo "================================================"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "❌ $FAILED route(s) failed!"
  exit 1
else
  echo ""
  echo "✅ All routes passed!"
  exit 0
fi

#!/bin/bash

# Test all team routes for 404 and 500 errors
# Usage: ./scripts/test-team-routes.sh

BASE_URL="http://app.localhost:3000"
FAILED=0
PASSED=0

echo "Testing Team Routes..."
echo "====================="
echo ""

# Function to test a route
test_route() {
  local route=$1
  local expected_status=$2
  local description=$3
  
  echo -n "Testing $description... "
  
  status=$(curl -sI "$BASE_URL$route" | grep "^HTTP" | awk '{print $2}')
  
  if [ "$status" = "$expected_status" ]; then
    echo "✓ PASS (HTTP $status)"
    ((PASSED++))
  elif [ "$status" = "307" ] || [ "$status" = "302" ]; then
    # Redirects are acceptable for auth-protected routes
    echo "✓ PASS (HTTP $status - Redirect)"
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

# Test all team routes
echo "Team Routes:"
echo "------------"
test_route "/team" "200" "Team root (redirects to dashboard)"
test_route "/team/dashboard" "200" "Team dashboard"
test_route "/team/scanner" "200" "Ticket scanner"
test_route "/team/issues" "200" "Issue reporting"
test_route "/team/notes" "200" "Quick notes"

echo ""
echo "Testing with query parameters:"
echo "------------------------------"
test_route "/team/scanner?eventId=test-123" "200" "Scanner with eventId"
test_route "/team/issues?eventId=test-123" "200" "Issues with eventId"
test_route "/team/notes?eventId=test-123" "200" "Notes with eventId"

echo ""
echo "Testing non-existent routes (should 404):"
echo "-----------------------------------------"
status=$(curl -sI "$BASE_URL/team/nonexistent" | grep "^HTTP" | awk '{print $2}')
if [ "$status" = "404" ]; then
  echo "✓ PASS - /team/nonexistent correctly returns 404"
  ((PASSED++))
else
  echo "✗ FAIL - /team/nonexistent returned HTTP $status (expected 404)"
  ((FAILED++))
fi

echo ""
echo "====================="
echo "Test Results:"
echo "  Passed: $PASSED"
echo "  Failed: $FAILED"
echo "====================="

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "❌ Some tests failed!"
  exit 1
else
  echo ""
  echo "✅ All tests passed!"
  exit 0
fi

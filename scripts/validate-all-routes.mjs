#!/usr/bin/env node

/**
 * Comprehensive Route Validation Script
 * Tests ALL routes in the application for 404 and 500 errors
 * Zero tolerance - must achieve 100% pass rate
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const TIMEOUT = 10000; // 10 seconds per request

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/events',
  '/music',
  '/news',
  '/shop',
  '/adventures',
  '/membership',
  '/privacy',
  '/terms',
  '/cookies',
  '/legal/privacy',
  '/legal/terms',
];

// Auth routes
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/onboarding',
];

// Protected routes (require authentication)
const PROTECTED_ROUTES = {
  member: [
    '/member/dashboard',
    '/member/orders',
    '/member/profile',
    '/member/schedule',
    '/member/favorites',
    '/member/credits',
    '/member/vouchers',
    '/member/referrals',
    '/member/cart',
    '/member/checkout',
    '/member/advances',
    '/member/advances/catalog',
    '/member/membership',
  ],
  organization: [
    '/organization/dashboard',
    '/organization/events',
    '/organization/products',
    '/organization/orders',
    '/organization/users',
    '/organization/roles',
    '/organization/inventory',
    '/organization/advances',
    '/organization/budgets',
    '/organization/contracts',
    '/organization/equipment',
    '/organization/tasks',
    '/organization/marketing',
    '/organization/artists',
    '/organization/brands',
    '/organization/credentials',
    '/organization/bulk-operations',
    '/organization/tickets',
    '/organization/reports',
    '/organization/permissions-test',
  ],
  team: [
    '/team/dashboard',
    '/team/scanner',
    '/team/issues',
    '/team/notes',
  ],
  legend: [
    '/legend/dashboard',
    '/legend/organizations',
    '/legend/venues',
    '/legend/vendors',
    '/legend/staff',
    '/legend/membership/companion-passes',
  ],
};

// API routes to test
const API_ROUTES = [
  '/api/health',
  '/api/ready',
];

class RouteValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async testRoute(route, expectedStatus = 200, method = 'GET') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const response = await fetch(`${BASE_URL}${route}`, {
        method,
        signal: controller.signal,
        redirect: 'manual', // Don't follow redirects
      });

      clearTimeout(timeoutId);

      const status = response.status;

      // Check for errors
      if (status === 404) {
        this.results.failed++;
        this.results.errors.push({
          route,
          status: 404,
          error: 'Route not found (404)',
        });
        this.log(`  ❌ ${route} - 404 NOT FOUND`, 'red');
        return false;
      }

      if (status === 500) {
        const text = await response.text();
        this.results.failed++;
        this.results.errors.push({
          route,
          status: 500,
          error: 'Internal server error (500)',
          details: text.substring(0, 200),
        });
        this.log(`  ❌ ${route} - 500 SERVER ERROR`, 'red');
        return false;
      }

      // Success cases
      if (status === 200 || status === 301 || status === 302 || status === 307) {
        this.results.passed++;
        const statusText = status === 200 ? 'OK' : `REDIRECT (${status})`;
        this.log(`  ✅ ${route} - ${statusText}`, 'green');
        return true;
      }

      // Other status codes
      if (status === 401 || status === 403) {
        // Expected for protected routes without auth
        this.results.passed++;
        this.log(`  ✅ ${route} - ${status} (Protected)`, 'cyan');
        return true;
      }

      // Unexpected status
      this.results.failed++;
      this.results.errors.push({
        route,
        status,
        error: `Unexpected status code: ${status}`,
      });
      this.log(`  ⚠️  ${route} - ${status}`, 'yellow');
      return false;

    } catch (error) {
      this.results.failed++;
      this.results.errors.push({
        route,
        error: error.message,
      });
      this.log(`  ❌ ${route} - ERROR: ${error.message}`, 'red');
      return false;
    }
  }

  async testRouteGroup(routes, groupName) {
    this.log(`\n${'='.repeat(60)}`, 'blue');
    this.log(`Testing ${groupName} Routes`, 'blue');
    this.log('='.repeat(60), 'blue');

    for (const route of routes) {
      await this.testRoute(route);
    }
  }

  async testProtectedRoutes() {
    for (const [portal, routes] of Object.entries(PROTECTED_ROUTES)) {
      await this.testRouteGroup(routes, `${portal.toUpperCase()} Portal`);
    }
  }

  async checkServerRunning() {
    try {
      const response = await fetch(`${BASE_URL}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async findAllPageRoutes() {
    try {
      const { stdout } = await execAsync(
        'find src/app -name "page.tsx" -type f | grep -v node_modules',
        { cwd: process.cwd() }
      );
      
      const files = stdout.trim().split('\n').filter(Boolean);
      const routes = files.map(file => {
        // Convert file path to route
        let route = file
          .replace('src/app', '')
          .replace('/page.tsx', '')
          .replace('/(auth)', '')
          .replace('/(public)', '');
        
        // Handle dynamic routes
        route = route.replace(/\[([^\]]+)\]/g, 'test-id');
        
        return route || '/';
      });

      return [...new Set(routes)]; // Remove duplicates
    } catch (error) {
      this.log(`Error finding routes: ${error.message}`, 'red');
      return [];
    }
  }

  printSummary() {
    this.log('\n' + '='.repeat(60), 'blue');
    this.log('VALIDATION SUMMARY', 'blue');
    this.log('='.repeat(60), 'blue');

    const total = this.results.passed + this.results.failed;
    const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;

    this.log(`\nTotal Routes Tested: ${total}`);
    this.log(`Passed: ${this.results.passed}`, 'green');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'green');
    this.log(`Pass Rate: ${passRate}%`, passRate === '100.0' ? 'green' : 'red');

    if (this.results.errors.length > 0) {
      this.log('\n' + '='.repeat(60), 'red');
      this.log('ERRORS FOUND', 'red');
      this.log('='.repeat(60), 'red');

      this.results.errors.forEach((error, index) => {
        this.log(`\n${index + 1}. ${error.route}`, 'red');
        this.log(`   Status: ${error.status || 'N/A'}`, 'yellow');
        this.log(`   Error: ${error.error}`, 'yellow');
        if (error.details) {
          this.log(`   Details: ${error.details}`, 'yellow');
        }
      });
    }

    this.log('\n' + '='.repeat(60), 'blue');

    if (passRate === '100.0') {
      this.log('✅ ALL ROUTES PASSED - ZERO ERRORS!', 'green');
    } else {
      this.log('❌ VALIDATION FAILED - ERRORS FOUND', 'red');
    }

    this.log('='.repeat(60) + '\n', 'blue');

    return passRate === '100.0';
  }
}

async function main() {
  const validator = new RouteValidator();

  validator.log('\n🚀 GVTEWAY Route Validation - Zero Tolerance\n', 'cyan');
  validator.log(`Testing against: ${BASE_URL}\n`, 'cyan');

  // Check if server is running
  validator.log('Checking if server is running...', 'yellow');
  const serverRunning = await validator.checkServerRunning();

  if (!serverRunning) {
    validator.log('❌ Server is not running!', 'red');
    validator.log(`Please start the server with: npm run dev`, 'yellow');
    process.exit(1);
  }

  validator.log('✅ Server is running\n', 'green');

  // Test all route groups
  await validator.testRouteGroup(PUBLIC_ROUTES, 'Public');
  await validator.testRouteGroup(AUTH_ROUTES, 'Authentication');
  await validator.testProtectedRoutes();
  await validator.testRouteGroup(API_ROUTES, 'API Health');

  // Print summary
  const success = validator.printSummary();

  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

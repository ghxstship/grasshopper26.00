#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3002';
const PASSWORD = 'Demo123!@#';

const demoUsers = [
  'legend@gvteway.demo',
  'superadmin@gvteway.demo',
  'admin@gvteway.demo',
  'lead@gvteway.demo',
  'team@gvteway.demo',
  'collaborator@gvteway.demo',
  'partner@gvteway.demo',
  'ambassador@gvteway.demo',
  'member@gvteway.demo',
  'trial@gvteway.demo',
  'attendee@gvteway.demo',
  'guest@gvteway.demo',
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testEndpoint(method, path, body = null, description = '') {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    const status = response.status;
    const HTTP_OK = 200;
    const HTTP_REDIRECT = 300;
    const HTTP_BAD_REQUEST = 400;
    const HTTP_SERVER_ERROR = 500;
    const statusColor = status >= HTTP_OK && status < HTTP_REDIRECT ? colors.green : 
                       status >= HTTP_BAD_REQUEST && status < HTTP_SERVER_ERROR ? colors.yellow : colors.red;
    
    console.log(`${statusColor}${status}${colors.reset} ${method.padEnd(6)} ${path} ${description ? `- ${description}` : ''}`);
    
    if (status >= HTTP_BAD_REQUEST) {
      const errorPreview = typeof data === 'string' ? data.substring(0, 100) : JSON.stringify(data, null, 2).substring(0, 200);
      console.log(`  ${colors.red}Error:${colors.reset}`, errorPreview);
    }
    
    return { status, data, success: status >= HTTP_OK && status < HTTP_REDIRECT };
  } catch (error) {
    console.log(`${colors.red}ERROR${colors.reset} ${method.padEnd(6)} ${path} - ${error.message}`);
    return { status: 0, data: null, success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Testing Auth Routes & API Endpoints${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };
  
  // Test 1: Login with all demo users
  console.log(`${colors.blue}▶ Testing Login Endpoint with All Demo Users${colors.reset}`);
  for (const email of demoUsers) {
    const result = await testEndpoint('POST', '/api/auth/login', 
      { email, password: PASSWORD }, 
      email
    );
    results.total++;
    if (result.success) results.passed++;
    else results.failed++;
  }
  
  console.log();
  
  // Test 2: Register endpoint with real email domain
  console.log(`${colors.blue}▶ Testing Register Endpoint${colors.reset}`);
  const testEmail = `test${Date.now()}@gmail.com`;
  const registerResult = await testEndpoint('POST', '/api/auth/register', {
    email: testEmail,
    password: PASSWORD,
    name: 'Test User',
  }, 'New user registration with real domain');
  results.total++;
  if (registerResult.success) results.passed++;
  else results.failed++;
  
  console.log();
  
  // Test 3: Register with invalid domain (should fail)
  console.log(`${colors.blue}▶ Testing Email Domain Validation${colors.reset}`);
  const HTTP_BAD_REQUEST = 400;
  const invalidDomainResult = await testEndpoint('POST', '/api/auth/register', {
    email: 'test@example.com',
    password: PASSWORD,
    name: 'Test User',
  }, 'Invalid domain - should fail with 400');
  results.total++;
  if (invalidDomainResult.status === HTTP_BAD_REQUEST) results.passed++;
  else results.failed++;
  
  console.log();
  
  // Test 4: Invalid login
  console.log(`${colors.blue}▶ Testing Invalid Credentials${colors.reset}`);
  const HTTP_UNAUTHORIZED = 401;
  const invalidResult = await testEndpoint('POST', '/api/auth/login', {
    email: 'legend@gvteway.demo',
    password: 'wrongpassword',
  }, 'Should fail with 401');
  results.total++;
  if (invalidResult.status === HTTP_UNAUTHORIZED) results.passed++;
  else results.failed++;
  
  console.log();
  
  // Test 5: Missing fields
  console.log(`${colors.blue}▶ Testing Validation${colors.reset}`);
  const missingEmailResult = await testEndpoint('POST', '/api/auth/login', {
    password: PASSWORD,
  }, 'Missing email - should fail with 400');
  results.total++;
  if (missingEmailResult.status === HTTP_BAD_REQUEST) results.passed++;
  else results.failed++;
  
  const missingPasswordResult = await testEndpoint('POST', '/api/auth/login', {
    email: 'legend@gvteway.demo',
  }, 'Missing password - should fail with 400');
  results.total++;
  if (missingPasswordResult.status === HTTP_BAD_REQUEST) results.passed++;
  else results.failed++;
  
  console.log();
  
  // Test 6: Other auth endpoints (GET requests)
  console.log(`${colors.blue}▶ Testing Auth Pages${colors.reset}`);
  
  const authRoutes = [
    { method: 'GET', path: '/login', desc: 'Login page' },
    { method: 'GET', path: '/signup', desc: 'Signup page' },
    { method: 'GET', path: '/forgot-password', desc: 'Forgot password page' },
    { method: 'GET', path: '/reset-password', desc: 'Reset password page' },
    { method: 'GET', path: '/verify-email', desc: 'Verify email page' },
  ];
  
  for (const route of authRoutes) {
    const result = await testEndpoint(route.method, route.path, null, route.desc);
    results.total++;
    if (result.success) results.passed++;
    else results.failed++;
  }
  
  console.log();
  
  // Summary
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✓ Passed:${colors.reset} ${results.passed}/${results.total}`);
  console.log(`${colors.red}✗ Failed:${colors.reset} ${results.failed}/${results.total}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  return results.failed === 0;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
});

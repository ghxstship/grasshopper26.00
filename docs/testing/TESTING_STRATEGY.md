# Testing Strategy & Guidelines

## Overview

GVTEWAY implements a comprehensive testing strategy covering all layers of the application, from unit tests to end-to-end workflows. This document outlines our testing approach, standards, and best practices.

## Test Coverage Goals

- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: Critical workflows covered
- **E2E Tests**: All user journeys tested
- **API Tests**: 100% endpoint coverage
- **Component Tests**: 70% coverage minimum
- **Security Tests**: Automated vulnerability scanning

## Test Types

### 1. Unit Tests (`tests/unit/`, `src/**/__tests__/`)

**Purpose**: Test individual functions, classes, and utilities in isolation.

**Tools**: Vitest, Testing Library

**Run**: `npm run test:unit`

**Examples**:
- Service layer functions
- Utility functions
- Business logic
- Data transformations

### 2. Component Tests (`tests/components/`)

**Purpose**: Test React components in isolation with mocked dependencies.

**Tools**: Vitest, React Testing Library

**Run**: `npm run test:components`

**Coverage**:
- EventCard
- TicketSelector
- MembershipCard
- Navigation components
- Form components

### 3. API Route Tests (`tests/api/`)

**Purpose**: Test API endpoints with various inputs and edge cases.

**Tools**: Vitest, NextRequest mocks

**Run**: `npm run test:api`

**Coverage**:
- Authentication endpoints
- Checkout flow
- Membership operations
- Admin operations
- Payment processing

### 4. Integration Tests (`tests/integration/`)

**Purpose**: Test complete workflows across multiple layers.

**Tools**: Vitest, Supabase client

**Run**: `npm run test:integration`

**Coverage**:
- Ticket purchase flow
- Membership lifecycle
- Credit redemption
- Order management

### 5. E2E Tests (`tests/e2e/`)

**Purpose**: Test complete user journeys in a browser environment.

**Tools**: Playwright

**Run**: `npm run test:e2e`

**Coverage**:
- Artist directory browsing
- Checkout process
- Membership subscription
- User authentication

### 6. Performance Tests (`tests/performance/`)

**Purpose**: Measure and validate application performance.

**Tools**: Playwright

**Run**: `npm run test:performance`

**Metrics**:
- Page load times
- API response times
- Concurrent user handling
- Memory usage
- Search performance

### 7. Security Tests (`tests/security/`)

**Purpose**: Validate security controls and prevent vulnerabilities.

**Tools**: Vitest, Playwright

**Run**: `npm run test:security`

**Coverage**:
- Input sanitization
- Authentication security
- Authorization checks
- CSRF protection
- XSS prevention
- SQL injection prevention

### 8. Accessibility Tests (`tests/accessibility/`)

**Purpose**: Ensure WCAG 2.1 AA compliance.

**Tools**: jest-axe, Playwright

**Run**: `npm run test:a11y`

**Coverage**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- ARIA labels
- Focus management

## Running Tests

### Local Development

```bash
# Run all tests
npm run test:all

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:api
npm run test:components
npm run test:integration
npm run test:e2e
```

### CI/CD Pipeline

```bash
# CI test suite (includes coverage gates)
npm run test:ci
```

The CI pipeline automatically:
- Runs all unit and integration tests
- Generates coverage reports
- Enforces coverage thresholds
- Runs E2E tests
- Executes security scans
- Uploads coverage to Codecov

## Coverage Thresholds

The following thresholds are enforced in CI:

```typescript
{
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80
}
```

Builds will fail if coverage drops below these thresholds.

## Writing Tests

### Best Practices

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test**: Keep tests focused
3. **Use descriptive names**: Test names should explain what they test
4. **Mock external dependencies**: Isolate the code under test
5. **Test edge cases**: Don't just test the happy path
6. **Keep tests fast**: Unit tests should run in milliseconds
7. **Avoid test interdependence**: Tests should run in any order

### Example Test Structure

```typescript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should handle valid input', () => {
    // Arrange
    const input = 'valid data';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  it('should reject invalid input', () => {
    const input = 'invalid data';
    
    expect(() => functionUnderTest(input)).toThrow();
  });
});
```

## Test Data Management

### Mock Data

Use the test helpers in `tests/utils/test-helpers.ts`:

```typescript
import { createMockEvent, createMockTicket } from '@/tests/utils/test-helpers';

const event = createMockEvent({ title: 'Custom Event' });
const ticket = createMockTicket({ eventId: event.id });
```

### Database Testing

Integration tests use the actual Supabase instance with test data:

```typescript
beforeEach(async () => {
  // Create test data
  const { data: event } = await supabase
    .from('events')
    .insert(testEvent)
    .select()
    .single();
});

afterEach(async () => {
  // Cleanup test data
  await supabase.from('events').delete().eq('id', event.id);
});
```

## Continuous Integration

### GitHub Actions Workflow

The CI pipeline runs on every push and pull request:

1. **Lint**: ESLint and TypeScript checks
2. **Unit Tests**: With coverage reporting
3. **Integration Tests**: Database workflows
4. **Security Tests**: Vulnerability scanning
5. **E2E Tests**: Browser automation
6. **Performance Tests**: Load testing
7. **Build**: Production build verification

### Coverage Reporting

Coverage reports are:
- Generated with every test run
- Uploaded to Codecov
- Commented on pull requests
- Enforced with minimum thresholds

## Debugging Tests

### Vitest

```bash
# Run tests in debug mode
node --inspect-brk ./node_modules/.bin/vitest

# Run specific test file
npm run test -- path/to/test.ts

# Update snapshots
npm run test -- -u
```

### Playwright

```bash
# Run with UI mode
npm run test:e2e:ui

# Run in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test --debug
```

## Performance Benchmarks

### Target Metrics

- **Page Load**: < 2s (LCP)
- **API Response**: < 500ms (p95)
- **Search**: < 300ms
- **Checkout Flow**: < 3s total
- **Concurrent Users**: 100+ without degradation

### Monitoring

Performance tests run automatically in CI and fail if metrics exceed thresholds.

## Security Testing

### Automated Scans

- **SAST**: Snyk security scanning
- **Dependency Audit**: npm audit
- **OWASP Top 10**: Covered in security tests
- **Penetration Testing**: Manual quarterly reviews

### Security Checklist

- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Secure headers
- ✅ Authentication security
- ✅ Authorization checks
- ✅ Rate limiting
- ✅ Session management

## Maintenance

### Regular Tasks

- **Weekly**: Review test failures and flaky tests
- **Monthly**: Update test dependencies
- **Quarterly**: Review and update test strategy
- **Annually**: Comprehensive test suite audit

### Test Debt

Track and address:
- Skipped tests
- Flaky tests
- Low coverage areas
- Outdated mocks
- Slow tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Support

For questions or issues with tests:
- Check this documentation first
- Review existing test examples
- Ask in #engineering Slack channel
- Create a GitHub issue for bugs

# IMPLEMENTATION GUIDE
## Integrating the UI/UX Audit Remediations

This guide provides step-by-step instructions for integrating the newly created design system, accessibility features, and compliance tools into your application.

---

## 1. IMMEDIATE INTEGRATION STEPS

### 1.1 Add Cookie Consent to Root Layout

Update your root layout to include the cookie consent banner:

```tsx
// src/app/layout.tsx
import { CookieConsent } from '@/components/privacy/cookie-consent';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
```

### 1.2 Verify Design Tokens Are Loaded

The design tokens are automatically imported via `globals.css`. Verify by checking any page:

```tsx
// Example: Using design tokens in a component
<div style={{ 
  color: 'var(--color-text-primary)',
  padding: 'var(--space-4)',
  borderRadius: 'var(--radius-lg)'
}}>
  Content
</div>
```

### 1.3 Run Token Validation

Add the validation script to your package.json:

```json
{
  "scripts": {
    "validate-tokens": "tsx scripts/validate-tokens.ts",
    "lint": "next lint && npm run validate-tokens"
  }
}
```

Run validation:
```bash
npm run validate-tokens
```

---

## 2. USING DESIGN TOKENS

### 2.1 In CSS/SCSS Files

```css
.my-component {
  /* Colors */
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: var(--border-width-default) solid var(--color-border-default);
  
  /* Spacing */
  padding: var(--space-4);
  margin-block: var(--space-6);
  gap: var(--space-3);
  
  /* Typography */
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  
  /* Border Radius */
  border-radius: var(--radius-lg);
  
  /* Shadows */
  box-shadow: var(--shadow-md);
  
  /* Transitions */
  transition: all var(--duration-fast) var(--easing-out);
}

/* Dark mode */
.dark .my-component {
  /* Colors automatically switch via CSS variables */
}
```

### 2.2 In TypeScript/React Components

```tsx
import { tokens } from '@/design-system/tokens';

// Access tokens programmatically
const MyComponent = () => {
  const theme = tokens.light;
  
  return (
    <div style={{
      color: theme.colors.text.primary,
      padding: theme.spacing[4],
      borderRadius: theme.borderRadius.lg,
    }}>
      Content
    </div>
  );
};
```

### 2.3 In Tailwind Classes

Tailwind is configured to use the design tokens via CSS variables:

```tsx
<div className="bg-primary text-primary-foreground p-4 rounded-lg">
  Tailwind with design tokens
</div>
```

---

## 3. IMPLEMENTING ACCESSIBILITY

### 3.1 Focus Management in Modals

```tsx
import { useEffect, useRef } from 'react';
import { focusManager } from '@/design-system/utils/focus-management';

export function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    // Save current focus
    focusManager.saveFocus();
    
    // Trap focus within modal
    const cleanup = focusManager.trapFocus(modalRef.current);
    
    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
      focusManager.restoreFocus();
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
    </div>
  );
}
```

### 3.2 ARIA Helpers

```tsx
import { ariaHelpers } from '@/design-system/utils/aria-helpers';

export function ExpandableSection({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = ariaHelpers.generateId('content');
  
  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        {title}
      </button>
      
      <div id={contentId} hidden={!isExpanded}>
        {children}
      </div>
    </div>
  );
}
```

### 3.3 Keyboard Navigation

```tsx
import { useRef, useEffect } from 'react';
import { KeyboardNavigation } from '@/design-system/utils/keyboard-navigation';

export function TabList({ tabs, onSelect }) {
  const tabRefs = useRef<HTMLButtonElement[]>([]);
  const keyboardNav = useRef<KeyboardNavigation | null>(null);
  
  useEffect(() => {
    keyboardNav.current = new KeyboardNavigation(tabRefs.current, {
      direction: 'horizontal',
      loop: true,
      onSelect: (index) => onSelect(tabs[index]),
    });
  }, [tabs, onSelect]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    keyboardNav.current?.handleKeyDown(e.nativeEvent);
  };
  
  return (
    <div role="tablist" onKeyDown={handleKeyDown}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => el && (tabRefs.current[index] = el)}
          role="tab"
          aria-selected={tab.isActive}
          tabIndex={tab.isActive ? 0 : -1}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 4. INTERNATIONALIZATION

### 4.1 Using Formatters

```tsx
import { createFormatters } from '@/lib/i18n/formatters';

export function EventCard({ event }) {
  const formatters = createFormatters('en-US'); // Get from context/state
  
  return (
    <div>
      <h3>{event.name}</h3>
      <p>Date: {formatters.formatDate(event.date)}</p>
      <p>Price: {formatters.formatCurrency(event.price)}</p>
      <p>Time: {formatters.getRelativeTime(event.date)}</p>
    </div>
  );
}
```

### 4.2 RTL Support

Ensure you use logical CSS properties:

```css
/* ❌ WRONG - Not RTL-friendly */
.element {
  margin-left: 16px;
  padding-right: 24px;
  text-align: left;
}

/* ✅ CORRECT - RTL-friendly */
.element {
  margin-inline-start: var(--space-4);
  padding-inline-end: var(--space-6);
  text-align: start;
}
```

---

## 5. PRIVACY & COMPLIANCE

### 5.1 Checking Cookie Consent

```tsx
import { PrivacyManager } from '@/lib/privacy/privacy-manager';

export function AnalyticsProvider({ children }) {
  const [canLoadAnalytics, setCanLoadAnalytics] = useState(false);
  
  useEffect(() => {
    // Check initial consent
    setCanLoadAnalytics(PrivacyManager.shouldLoadAnalytics());
    
    // Listen for consent changes
    const handleConsentUpdate = (e: CustomEvent) => {
      setCanLoadAnalytics(e.detail.analytics);
    };
    
    window.addEventListener('cookie-preferences-updated', handleConsentUpdate);
    
    return () => {
      window.removeEventListener('cookie-preferences-updated', handleConsentUpdate);
    };
  }, []);
  
  if (!canLoadAnalytics) return <>{children}</>;
  
  return (
    <>
      {children}
      <Script src="https://analytics.example.com/script.js" />
    </>
  );
}
```

### 5.2 Anonymizing Data

```tsx
import { PrivacyManager } from '@/lib/privacy/privacy-manager';

// Anonymize IP addresses
const anonymizedIP = PrivacyManager.anonymizeIP('192.168.1.100');
// Result: '192.168.1.0'

// Hash PII
const hashedEmail = await PrivacyManager.hashPII('user@example.com');
// Result: SHA-256 hash

// Pseudonymize user data
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: { theme: 'dark' }
};
const pseudonymized = PrivacyManager.pseudonymize(userData);
// Result: { preferences: { theme: 'dark' } } - PII removed
```

---

## 6. VALIDATION & CI/CD

### 6.1 Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run validate-tokens
```

### 6.2 GitHub Actions

Add to `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run validate-tokens
      - run: npm run lint
      - run: npm run type-check
```

---

## 7. TESTING

### 7.1 Accessibility Testing (Recommended)

Install jest-axe:
```bash
npm install --save-dev jest-axe @testing-library/react
```

Create test:
```tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 8. MIGRATION CHECKLIST

### For Each Component:

- [ ] Replace hardcoded colors with `var(--color-*)`
- [ ] Replace hardcoded spacing with `var(--space-*)`
- [ ] Replace hardcoded font sizes with `var(--font-size-*)`
- [ ] Use logical CSS properties (margin-inline-start vs margin-left)
- [ ] Add proper ARIA attributes
- [ ] Implement keyboard navigation
- [ ] Add focus management
- [ ] Test with screen reader
- [ ] Test in dark mode
- [ ] Test at all breakpoints
- [ ] Externalize hardcoded strings

### For Each Page:

- [ ] Add proper page title
- [ ] Add meta description
- [ ] Implement proper heading hierarchy (h1 → h6)
- [ ] Add skip navigation link
- [ ] Test keyboard navigation flow
- [ ] Verify color contrast
- [ ] Test with screen reader
- [ ] Test responsive behavior
- [ ] Add loading states with aria-live
- [ ] Add error states with proper ARIA

---

## 9. COMMON PATTERNS

### 9.1 Loading States

```tsx
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>
```

### 9.2 Error Messages

```tsx
const errorId = 'email-error';

<input
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? errorId : undefined}
/>
{hasError && (
  <div id={errorId} role="alert">
    {errorMessage}
  </div>
)}
```

### 9.3 Form Validation

```tsx
import { focusManager } from '@/design-system/utils/focus-management';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const errors = validate(formData);
  
  if (errors.length > 0) {
    // Focus first error
    focusManager.focusFirstError(formRef.current);
    
    // Announce to screen readers
    focusManager.announce(
      `Form has ${errors.length} errors. Please correct them.`,
      'assertive'
    );
  }
};
```

---

## 10. RESOURCES

### Documentation
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Testing
- [NVDA](https://www.nvaccess.org/) - Free screen reader (Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Screen reader
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built-in (macOS/iOS)

---

## SUPPORT

For questions or issues:
- Review the `UI_UX_AUDIT_REPORT.md` for detailed information
- Check design token definitions in `src/design-system/tokens/`
- Consult utility documentation in `src/design-system/utils/`
- Contact: engineering@grasshopper.com

**Remember:** The design system is your foundation. Never circumvent it with hardcoded values!

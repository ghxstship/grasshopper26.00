# GVTEWAY Design System - Quick Start Guide

## Overview

The GVTEWAY design system is a comprehensive, token-based atomic design system with ZERO TOLERANCE for hardcoded values. This guide will help you get started using the system correctly.

## Core Principles

1. **Token-First Architecture:** Never use hardcoded values
2. **Responsive by Default:** Mobile-first with fluid scaling
3. **Accessibility Mandatory:** WCAG 2.2 AAA compliance
4. **International Ready:** RTL support, locale-aware formatting
5. **Design System as Source of Truth:** All UI derives from atomic components

---

## Using Design Tokens

### ❌ FORBIDDEN - Hardcoded Values

```tsx
// NEVER DO THIS
<div style={{ 
  color: '#3B82F6', 
  padding: '16px',
  fontSize: '14px',
  backgroundColor: '#FFFFFF'
}} />

<Button className="bg-blue-500 text-white p-4" />
```

### ✅ REQUIRED - Token-Based

```tsx
// ALWAYS DO THIS
<div style={{ 
  color: 'var(--color-primary)', 
  padding: 'var(--space-4)',
  fontSize: 'var(--font-size-sm)',
  backgroundColor: 'var(--color-bg-primary)'
}} />

<Button variant="primary" size="md" />
```

---

## Available Tokens

### Colors

```tsx
// Interactive colors
var(--color-primary)
var(--color-primary-hover)
var(--color-primary-active)
var(--color-secondary)
var(--color-accent)

// Text colors
var(--color-text-primary)
var(--color-text-secondary)
var(--color-text-tertiary)
var(--color-text-inverse)

// Background colors
var(--color-bg-primary)
var(--color-bg-secondary)
var(--color-bg-tertiary)

// Border colors
var(--color-border-default)
var(--color-border-strong)
var(--color-border-focus)

// Status colors
var(--color-success)
var(--color-error)
var(--color-warning)
var(--color-info)
```

### Spacing

```tsx
// Use spacing tokens for all margin, padding, gap
var(--space-0)    // 0
var(--space-1)    // 4px
var(--space-2)    // 8px
var(--space-3)    // 12px
var(--space-4)    // 16px
var(--space-6)    // 24px
var(--space-8)    // 32px
var(--space-12)   // 48px
var(--space-16)   // 64px
// ... up to --space-96 (384px)
```

### Typography

```tsx
// Font sizes
var(--font-size-xs)    // 12px
var(--font-size-sm)    // 14px
var(--font-size-base)  // 16px
var(--font-size-lg)    // 18px
var(--font-size-xl)    // 20px
var(--font-size-2xl)   // 24px
// ... up to --font-size-9xl

// Font weights
var(--font-weight-normal)    // 400
var(--font-weight-medium)    // 500
var(--font-weight-semibold)  // 600
var(--font-weight-bold)      // 700

// Line heights
var(--line-height-tight)   // 1.25
var(--line-height-normal)  // 1.5
var(--line-height-relaxed) // 1.625
```

### Shadows & Borders

```tsx
// Shadows
var(--shadow-sm)
var(--shadow-base)
var(--shadow-md)
var(--shadow-lg)
var(--shadow-xl)

// Border radius
var(--radius-sm)    // 2px
var(--radius-base)  // 4px
var(--radius-md)    // 6px
var(--radius-lg)    // 8px
var(--radius-xl)    // 12px
var(--radius-full)  // 9999px
```

### Transitions

```tsx
// Durations
var(--duration-fast)   // 150ms
var(--duration-base)   // 250ms
var(--duration-slow)   // 350ms

// Easing
var(--easing-in)
var(--easing-out)
var(--easing-in-out)
var(--easing-spring)
```

---

## Creating Components

### Button Example

```tsx
// ✅ CORRECT Implementation
import styles from './button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children 
}: ButtonProps) => {
  return (
    <button 
      className={styles.button} 
      data-variant={variant} 
      data-size={size}
    >
      {children}
    </button>
  );
};
```

```css
/* button.module.css */
.button {
  /* Base styles using tokens */
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-out);
  border: var(--border-width-default) solid transparent;
  cursor: pointer;
  
  /* Accessibility */
  min-height: 44px; /* Touch target */
  
  /* Focus state */
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: var(--opacity-50);
    cursor: not-allowed;
  }
}

/* Size variants */
.button[data-size="sm"] {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
}

.button[data-size="md"] {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
}

.button[data-size="lg"] {
  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-lg);
}

/* Color variants */
.button[data-variant="primary"] {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  
  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }
  
  &:active:not(:disabled) {
    background-color: var(--color-primary-active);
  }
}
```

---

## Responsive Design

### Mobile-First Approach

```css
/* ✅ CORRECT - Mobile first */
.container {
  /* Mobile base (320px+) */
  padding-inline: var(--space-4);
  
  /* Tablet (768px+) */
  @media (min-width: 768px) {
    padding-inline: var(--space-6);
  }
  
  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    padding-inline: var(--space-8);
  }
}

/* ✅ Fluid scaling with clamp() */
.section {
  padding-block: clamp(var(--space-8), 5vw, var(--space-16));
}
```

---

## RTL Support

### Use Logical Properties

```css
/* ❌ FORBIDDEN - Directional properties */
.element {
  margin-left: var(--space-4);
  padding-right: var(--space-6);
  text-align: left;
}

/* ✅ REQUIRED - Logical properties */
.element {
  margin-inline-start: var(--space-4);
  padding-inline-end: var(--space-6);
  text-align: start;
}
```

---

## Accessibility Requirements

### 1. Keyboard Navigation

```tsx
// ✅ All interactive elements must be keyboard accessible
<button 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

### 2. ARIA Attributes

```tsx
// ✅ Modals must have proper ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
</div>
```

### 3. Focus Management

```tsx
import { focusManager } from '@/design-system/utils/focus-management';

// ✅ Trap focus in modals
useEffect(() => {
  if (isOpen && modalRef.current) {
    focusManager.saveFocus();
    const cleanup = focusManager.trapFocus(modalRef.current);
    
    return () => {
      cleanup();
      focusManager.restoreFocus();
    };
  }
}, [isOpen]);
```

### 4. Color Contrast

```tsx
// ✅ All text must meet 7:1 contrast ratio (AAA)
// Design tokens already ensure this
<p style={{ color: 'var(--color-text-primary)' }}>
  This text meets AAA contrast requirements
</p>
```

---

## Internationalization

### Using Translations

```tsx
import { useTranslation } from 'next-i18next';

export const MyComponent = () => {
  const { t, i18n } = useTranslation('common');
  
  return (
    <div dir={i18n.dir()}>
      <button>{t('buttons.save')}</button>
      <p>{t('forms.validation.required')}</p>
    </div>
  );
};
```

### Locale Formatting

```tsx
import { getFormatter } from '@/i18n/formatters';

const formatter = getFormatter('en-US');

// Format dates
formatter.formatDate(new Date()); // "Jan 15, 2025"

// Format currency
formatter.formatCurrency(1234.56, 'USD'); // "$1,234.56"

// Format relative time
formatter.formatRelativeTime(-2, 'hours'); // "2 hours ago"
```

---

## Privacy & Compliance

### Check Cookie Consent

```tsx
import { PrivacyManager } from '@/lib/privacy/privacy-manager';

// ✅ Check consent before loading analytics
if (PrivacyManager.shouldLoadAnalytics()) {
  initializeAnalytics();
}

// ✅ Check consent before loading marketing
if (PrivacyManager.shouldLoadMarketing()) {
  initializeMarketing();
}
```

---

## Validation & Testing

### Run Token Validator

```bash
# Validate all files use design tokens
npm run validate:tokens

# This will fail if any hardcoded values are found
```

### Run Accessibility Tests

```bash
# Run accessibility test suite
npm run test:a11y

# This checks WCAG 2.2 AAA compliance
```

---

## Common Patterns

### Card Component

```tsx
<Card className="p-6 rounded-lg shadow-md">
  <h3 className="text-xl font-semibold mb-4">Card Title</h3>
  <p className="text-secondary">Card content</p>
</Card>
```

### Form Field

```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <input
    id="email"
    type="email"
    className="w-full px-4 py-2 border rounded-md"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <p id="email-error" role="alert" className="text-sm text-error">
      Please enter a valid email
    </p>
  )}
</div>
```

### Loading State

```tsx
<div role="status" aria-live="polite" aria-busy="true">
  <Spinner />
  <span className="sr-only">Loading...</span>
</div>
```

---

## Resources

- **Token Reference:** `/src/design-system/tokens/`
- **Component Library:** `/src/components/ui/`
- **Accessibility Utils:** `/src/design-system/utils/`
- **i18n Config:** `/src/i18n/`
- **Privacy Utils:** `/src/lib/privacy/`

## Getting Help

- Review the full audit report: `/docs/audits/ATOMIC_DESIGN_SYSTEM_AUDIT_REPORT.md`
- Check component examples in `/src/components/ui/`
- Run `npm run validate:tokens` to check for violations
- Contact: support@gvteway.com

---

**Remember:** Hardcoded values are technical debt. Always use design tokens. Always test accessibility. Always support internationalization.

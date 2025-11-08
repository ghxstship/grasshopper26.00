# 🚀 QUICK REFERENCE CARD
## Design System & Accessibility Essentials

---

## 🎨 DESIGN TOKENS

### Colors
```css
/* Text */
var(--color-text-primary)      /* #111827 */
var(--color-text-secondary)    /* #4B5563 */
var(--color-text-brand)        /* #9333EA */

/* Backgrounds */
var(--color-bg-primary)        /* #FFFFFF */
var(--color-bg-secondary)      /* #F9FAFB */

/* Interactive */
var(--color-primary)           /* #9333EA */
var(--color-accent)            /* #EC4899 */

/* Status */
var(--color-success)           /* #22C55E */
var(--color-error)             /* #EF4444 */
var(--color-warning)           /* #F59E0B */

/* Borders */
var(--color-border-default)    /* #E5E7EB */
var(--color-border-focus)      /* #9333EA */
```

### Spacing (4px grid)
```css
var(--space-1)   /* 4px */
var(--space-2)   /* 8px */
var(--space-3)   /* 12px */
var(--space-4)   /* 16px */
var(--space-6)   /* 24px */
var(--space-8)   /* 32px */
var(--space-12)  /* 48px */
var(--space-16)  /* 64px */
```

### Typography
```css
/* Sizes */
var(--font-size-xs)    /* 12px */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px */
var(--font-size-lg)    /* 18px */
var(--font-size-xl)    /* 20px */
var(--font-size-2xl)   /* 24px */
var(--font-size-4xl)   /* 36px */

/* Weights */
var(--font-weight-normal)    /* 400 */
var(--font-weight-medium)    /* 500 */
var(--font-weight-semibold)  /* 600 */
var(--font-weight-bold)      /* 700 */
```

### Effects
```css
/* Shadows */
var(--shadow-sm)    /* Small shadow */
var(--shadow-md)    /* Medium shadow */
var(--shadow-lg)    /* Large shadow */
var(--shadow-glow)  /* Brand glow */

/* Radius */
var(--radius-sm)    /* 2px */
var(--radius-md)    /* 6px */
var(--radius-lg)    /* 8px */
var(--radius-full)  /* 9999px */

/* Transitions */
var(--duration-fast)  /* 150ms */
var(--duration-base)  /* 250ms */
var(--easing-out)     /* cubic-bezier */
```

---

## ♿ ACCESSIBILITY

### ARIA Attributes
```tsx
// Buttons
<button aria-label="Close dialog">×</button>
<button aria-pressed={isActive}>Toggle</button>
<button aria-expanded={isOpen}>Menu</button>

// Links
<a href="..." aria-label="Read more about Event Name">
  Read more
</a>

// Forms
<input
  aria-invalid={hasError}
  aria-describedby="error-id"
  aria-required="true"
/>

// Status
<div role="status" aria-live="polite">
  Loading...
</div>

// Alerts
<div role="alert" aria-live="assertive">
  Error occurred!
</div>

// Dialogs
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
```

### Focus Management
```tsx
import { focusManager } from '@/design-system/utils/focus-management';

// Save and restore focus
focusManager.saveFocus();
focusManager.restoreFocus();

// Trap focus in modal
const cleanup = focusManager.trapFocus(modalElement);

// Focus first error
focusManager.focusFirstError(formElement);

// Announce to screen readers
focusManager.announce('Success!', 'polite');
```

### Keyboard Navigation
```tsx
import { KeyboardNavigation } from '@/design-system/utils/keyboard-navigation';

const nav = new KeyboardNavigation(elements, {
  direction: 'horizontal', // or 'vertical' or 'both'
  loop: true,
  onSelect: (index) => handleSelect(index),
  onEscape: () => handleClose(),
});

// In event handler
const handleKeyDown = (e) => {
  nav.handleKeyDown(e);
};
```

---

## 🌍 INTERNATIONALIZATION

### Formatters
```tsx
import { createFormatters } from '@/lib/i18n/formatters';

const fmt = createFormatters('en-US');

// Dates
fmt.formatDate(new Date())              // "Jan 15, 2025"
fmt.formatDateTime(new Date())          // "Jan 15, 2025, 3:30 PM"
fmt.formatTime(new Date())              // "3:30 PM"

// Numbers
fmt.formatNumber(1234.56)               // "1,234.56"
fmt.formatCurrency(99.99, 'USD')        // "$99.99"
fmt.formatPercent(0.85)                 // "85%"

// Relative Time
fmt.getRelativeTime(pastDate)           // "2 hours ago"
fmt.formatRelativeTime(-2, 'hours')     // "2 hours ago"

// Lists
fmt.formatList(['A', 'B', 'C'])         // "A, B, and C"
```

### RTL Support
```css
/* ❌ WRONG */
margin-left: 16px;
padding-right: 24px;
text-align: left;

/* ✅ CORRECT */
margin-inline-start: var(--space-4);
padding-inline-end: var(--space-6);
text-align: start;
```

---

## 🔒 PRIVACY

### Cookie Consent
```tsx
import { PrivacyManager } from '@/lib/privacy/privacy-manager';

// Check consent
if (PrivacyManager.hasConsent('analytics')) {
  // Load analytics
}

// Get preferences
const prefs = PrivacyManager.getPreferences();

// Listen for changes
window.addEventListener('cookie-preferences-updated', (e) => {
  console.log(e.detail); // { necessary, analytics, marketing, preferences }
});
```

### Data Anonymization
```tsx
// Anonymize IP
const ip = PrivacyManager.anonymizeIP('192.168.1.100');
// Result: '192.168.1.0'

// Hash PII
const hash = await PrivacyManager.hashPII('user@example.com');

// Pseudonymize data
const clean = PrivacyManager.pseudonymize(userData);
```

---

## 🧪 VALIDATION

### Run Token Validator
```bash
npm run validate-tokens
```

### Common Violations
```tsx
// ❌ FORBIDDEN
<div style={{ color: '#3B82F6' }} />
<div style={{ padding: '16px' }} />
const size = 14;

// ✅ REQUIRED
<div style={{ color: 'var(--color-primary)' }} />
<div style={{ padding: 'var(--space-4)' }} />
const size = tokens.light.typography.fontSize.sm;
```

---

## 📦 IMPORTS

```tsx
// Design Tokens
import { tokens } from '@/design-system/tokens';

// Accessibility
import { focusManager } from '@/design-system/utils/focus-management';
import { ariaHelpers } from '@/design-system/utils/aria-helpers';
import { KeyboardNavigation } from '@/design-system/utils/keyboard-navigation';

// i18n
import { createFormatters } from '@/lib/i18n/formatters';
import { i18nConfig } from '@/lib/i18n/config';

// Privacy
import { PrivacyManager } from '@/lib/privacy/privacy-manager';
import { CookieConsent } from '@/components/privacy/cookie-consent';
```

---

## 🎯 COMMON PATTERNS

### Accessible Button
```tsx
<button
  aria-label="Close"
  onClick={handleClose}
  style={{
    padding: 'var(--space-3) var(--space-6)',
    background: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--duration-fast) var(--easing-out)',
  }}
>
  Close
</button>
```

### Accessible Form Field
```tsx
const errorId = 'email-error';

<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? errorId : undefined}
    style={{
      padding: 'var(--space-3)',
      borderRadius: 'var(--radius-md)',
      border: `var(--border-width-default) solid var(--color-border-default)`,
    }}
  />
  {hasError && (
    <div id={errorId} role="alert" style={{ color: 'var(--color-error)' }}>
      {errorMessage}
    </div>
  )}
</div>
```

### Loading State
```tsx
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <span>Loading...</span>
  ) : (
    <span>Content loaded</span>
  )}
</div>
```

---

## 📚 DOCUMENTATION

- **Full Audit Report**: `UI_UX_AUDIT_REPORT.md`
- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`
- **Completion Summary**: `AUDIT_COMPLETION_SUMMARY.md`
- **This Reference**: `QUICK_REFERENCE.md`

---

## 🆘 TROUBLESHOOTING

### Token Not Working?
1. Check if `globals.css` imports `tokens.css`
2. Verify CSS variable name (use browser DevTools)
3. Ensure no typos in `var(--token-name)`

### Accessibility Issue?
1. Test with keyboard (Tab, Enter, Escape, Arrows)
2. Test with screen reader (NVDA, JAWS, VoiceOver)
3. Run axe DevTools browser extension
4. Check ARIA attributes in DevTools

### Validation Failing?
1. Run `npm run validate-tokens` to see violations
2. Replace hardcoded values with tokens
3. Use logical CSS properties for RTL support
4. Check excluded files list if false positive

---

**Keep this card handy for quick reference!** 📌

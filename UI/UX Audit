# WINDSURF: ATOMIC DESIGN SYSTEM & UI/UX AUDIT FRAMEWORK
## Full Stack Implementation & Optimization Protocol

---

## MISSION CRITICAL DIRECTIVES

You are tasked with auditing, implementing, and optimizing a comprehensive atomic design system with **ZERO TOLERANCE** for hardcoded design values. Every visual element, spacing unit, color value, typography setting, and interaction pattern must be systematically defined, tokenized, and enforced across the entire application stack.

### Core Principles
1. **Token-First Architecture**: No hardcoded values anywhere in the codebase
2. **Responsive by Default**: Mobile-first with fluid scaling across all breakpoints
3. **Accessibility Mandatory**: WCAG 2.2 AAA compliance minimum
4. **International Ready**: RTL support, locale-aware formatting, GDPR/CCPA compliant
5. **Design System as Source of Truth**: All UI derives from atomic components

---

## PHASE 1: COMPREHENSIVE SYSTEM AUDIT

### 1.1 DESIGN TOKEN AUDIT

**ACTION**: Scan entire codebase for violations and create complete token inventory.

#### Violations to Flag:
```typescript
// ❌ FORBIDDEN - Hardcoded values
<div style={{ color: '#3B82F6', padding: '16px' }} />
<Button className="bg-blue-500 text-white" />
const spacing = 8;
font-size: 14px;

// ✅ REQUIRED - Token-based
<div className={styles.container} />
<Button variant="primary" size="md" />
const spacing = tokens.space[2];
font-size: var(--font-size-sm);
```

#### Token Categories to Audit:

**Color Tokens**
- [ ] Primitive colors (base palette)
- [ ] Semantic colors (brand, success, error, warning, info)
- [ ] Surface colors (backgrounds, cards, overlays)
- [ ] Border colors (dividers, outlines, focus states)
- [ ] Text colors (primary, secondary, tertiary, disabled)
- [ ] Interactive states (hover, active, focus, disabled)
- [ ] Alpha variants (transparency levels)
- [ ] Dark mode equivalents for all tokens
- [ ] High contrast mode alternatives

**Spacing Tokens**
- [ ] Base unit system (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px)
- [ ] Component-specific spacing (padding, margin, gap)
- [ ] Layout spacing (container, section, grid gaps)
- [ ] Negative spacing (for overlaps, pull effects)
- [ ] Responsive scaling multipliers

**Typography Tokens**
- [ ] Font families (primary, secondary, monospace, display)
- [ ] Font sizes (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl)
- [ ] Font weights (thin, light, regular, medium, semibold, bold, extrabold)
- [ ] Line heights (tight, normal, relaxed, loose)
- [ ] Letter spacing (tighter, tight, normal, wide, wider)
- [ ] Text decoration (underline offsets, thickness)
- [ ] Responsive typography scales

**Border & Radius Tokens**
- [ ] Border widths (hairline, thin, base, thick)
- [ ] Border radius (none, sm, base, md, lg, xl, 2xl, 3xl, full)
- [ ] Border styles (solid, dashed, dotted)
- [ ] Outline widths and offsets

**Shadow & Elevation Tokens**
- [ ] Shadow presets (xs, sm, base, md, lg, xl, 2xl, inner)
- [ ] Elevation levels (0-24 for z-index)
- [ ] Glow effects (for focus, hover states)
- [ ] Inset shadows

**Animation & Transition Tokens**
- [ ] Duration values (instant, fast, base, slow, slower)
- [ ] Easing functions (linear, ease-in, ease-out, ease-in-out, spring)
- [ ] Delay values
- [ ] Animation keyframes (fade, slide, scale, spin)

**Breakpoint Tokens**
- [ ] Mobile (320px, 375px, 425px)
- [ ] Tablet (768px, 834px, 1024px)
- [ ] Desktop (1280px, 1440px, 1920px)
- [ ] Ultra-wide (2560px+)
- [ ] Custom container breakpoints

**Layout Tokens**
- [ ] Container max-widths
- [ ] Grid columns (12-column, 16-column systems)
- [ ] Aspect ratios (16:9, 4:3, 1:1, 21:9)
- [ ] Safe area insets (for mobile notches)

---

### 1.2 COMPONENT ARCHITECTURE AUDIT

**ACTION**: Inventory all components and classify by atomic design hierarchy.

#### Atomic Design Classification:

**Atoms** (Foundational, indivisible elements)
- [ ] Button (all variants: primary, secondary, tertiary, ghost, danger)
- [ ] Input (text, number, email, password, search, tel, url)
- [ ] Label
- [ ] Icon (with systematic sizing: xs, sm, md, lg, xl)
- [ ] Badge
- [ ] Avatar
- [ ] Spinner/Loader
- [ ] Divider
- [ ] Checkbox
- [ ] Radio
- [ ] Toggle/Switch
- [ ] Progress bar
- [ ] Skeleton loader
- [ ] Tooltip trigger
- [ ] Link
- [ ] Tag/Chip

**Molecules** (Simple component groups)
- [ ] Form field (Label + Input + Helper text + Error)
- [ ] Search bar (Input + Icon + Clear button)
- [ ] Card header (Title + Subtitle + Action)
- [ ] List item (Icon + Text + Badge + Action)
- [ ] Breadcrumb item
- [ ] Tab item
- [ ] Accordion item
- [ ] Menu item
- [ ] Notification item
- [ ] Avatar with status
- [ ] Button group
- [ ] Icon button with label
- [ ] Stat card (Label + Value + Change indicator)

**Organisms** (Complex component assemblies)
- [ ] Navigation bar (Logo + Nav items + Actions + Mobile menu)
- [ ] Sidebar (Navigation + User profile + Settings)
- [ ] Data table (Headers + Rows + Pagination + Filters)
- [ ] Form (Multiple fields + Validation + Submit)
- [ ] Modal/Dialog (Header + Body + Footer + Close)
- [ ] Card (Header + Content + Footer)
- [ ] Hero section
- [ ] Feature grid
- [ ] Pricing table
- [ ] Testimonial carousel
- [ ] Footer (Links + Social + Legal)
- [ ] Search results list
- [ ] Comment thread
- [ ] File upload zone

**Templates** (Page-level compositions)
- [ ] Dashboard layout
- [ ] Authentication layout (Login/Signup)
- [ ] Settings layout (Sidebar + Content)
- [ ] Detail page layout (Header + Sidebar + Main)
- [ ] List page layout (Filters + Table + Pagination)
- [ ] Landing page layout
- [ ] Error page layout (404, 500)
- [ ] Empty state layout

**Pages** (Fully populated instances)
- [ ] Audit each page for template consistency
- [ ] Verify all components are sourced from design system
- [ ] Flag any one-off custom implementations

---

### 1.3 RESPONSIVE BEHAVIOR AUDIT

**ACTION**: Test and document responsive behavior across all breakpoints.

#### Breakpoint Testing Matrix:

```typescript
// Define systematic breakpoint testing
const BREAKPOINTS = {
  'mobile-xs': 320,
  'mobile-sm': 375,
  'mobile-md': 425,
  'tablet-sm': 768,
  'tablet-md': 834,
  'tablet-lg': 1024,
  'desktop-sm': 1280,
  'desktop-md': 1440,
  'desktop-lg': 1920,
  'desktop-xl': 2560,
};
```

#### Components to Test at Each Breakpoint:

**Layout Behavior**
- [ ] Grid columns collapse appropriately
- [ ] Flex containers wrap/stack correctly
- [ ] Container padding scales proportionally
- [ ] Sidebar converts to drawer/overlay on mobile
- [ ] Navigation collapses to hamburger menu
- [ ] Tables convert to card view on mobile

**Typography Scaling**
- [ ] Heading sizes scale down on smaller screens
- [ ] Body text remains readable (min 16px on mobile)
- [ ] Line height adjusts for smaller screens
- [ ] No text overflow or truncation issues

**Interactive Elements**
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Buttons stack vertically on mobile
- [ ] Form inputs expand to full width on mobile
- [ ] Dropdowns and selects are mobile-friendly
- [ ] Modals take full screen on mobile

**Images & Media**
- [ ] Images use srcset for responsive loading
- [ ] Videos scale proportionally
- [ ] Aspect ratios maintained across devices
- [ ] Lazy loading implemented
- [ ] WebP with fallbacks

---

### 1.4 ACCESSIBILITY AUDIT (WCAG 2.2 AAA)

**ACTION**: Systematic accessibility compliance verification.

#### Color Contrast Testing:
```typescript
// All color combinations must meet these minimums:
const CONTRAST_REQUIREMENTS = {
  'AAA-normal-text': 7.0,      // 18pt+ or 14pt+ bold
  'AAA-large-text': 4.5,       // Smaller than above
  'AA-normal-text': 4.5,       // Minimum fallback
  'AA-large-text': 3.0,        // Minimum fallback
  'UI-components': 3.0,        // Buttons, icons, etc.
};
```

**Tests Required:**
- [ ] All text/background combinations exceed 7:1 ratio
- [ ] Interactive elements exceed 3:1 ratio
- [ ] Focus indicators are visible (3:1 against background)
- [ ] Error states clearly distinguishable without color alone
- [ ] Charts/graphs have patterns + colors

#### Keyboard Navigation:
- [ ] All interactive elements reachable by Tab
- [ ] Logical tab order (left-to-right, top-to-bottom)
- [ ] Skip navigation link present
- [ ] Escape key closes modals/dialogs
- [ ] Arrow keys navigate menus/lists
- [ ] Enter/Space activate buttons/links
- [ ] Custom components have proper ARIA keyboard patterns

#### Screen Reader Testing:
- [ ] All images have descriptive alt text
- [ ] Decorative images use alt="" or role="presentation"
- [ ] Form inputs have associated labels
- [ ] Error messages announced to screen readers
- [ ] Loading states announced (aria-live)
- [ ] Page title updates on route change
- [ ] Landmarks used (header, nav, main, aside, footer)
- [ ] Headings follow proper hierarchy (h1 → h6)
- [ ] Tables have proper headers and scope

#### ARIA Implementation:
```typescript
// Required ARIA patterns:
const ARIA_PATTERNS = {
  Button: 'role, aria-pressed, aria-expanded, aria-label',
  Link: 'aria-label (when text insufficient)',
  Modal: 'role=dialog, aria-modal, aria-labelledby, aria-describedby',
  Tab: 'role=tablist/tab/tabpanel, aria-selected, aria-controls',
  Accordion: 'role=region, aria-expanded, aria-controls',
  Combobox: 'role=combobox, aria-expanded, aria-controls, aria-activedescendant',
  Alert: 'role=alert, aria-live=assertive',
  Status: 'role=status, aria-live=polite',
  Menu: 'role=menu/menuitem/menubar, aria-haspopup',
};
```

#### Focus Management:
- [ ] Visible focus indicators on all elements
- [ ] Focus trap in modals/dialogs
- [ ] Focus returns to trigger after modal close
- [ ] Focus moves to first error on form submission
- [ ] No keyboard traps (can always escape)

#### Motion & Animation:
- [ ] Respect prefers-reduced-motion
- [ ] Animations can be paused
- [ ] No auto-playing videos with audio
- [ ] No flashing content (seizure risk)

---

### 1.5 INTERNATIONALIZATION (i18n) AUDIT

**ACTION**: Ensure global-ready implementation.

#### RTL (Right-to-Left) Support:
- [ ] All layouts flip correctly for RTL languages (Arabic, Hebrew)
- [ ] Margins/padding use logical properties (inline-start, inline-end)
- [ ] Icons flip appropriately (arrows, chevrons)
- [ ] Text alignment switches (text-align: start/end)
- [ ] Animations reverse direction

```css
/* ❌ FORBIDDEN */
margin-left: 16px;
padding-right: 24px;
text-align: left;

/* ✅ REQUIRED */
margin-inline-start: var(--space-4);
padding-inline-end: var(--space-6);
text-align: start;
```

#### Locale-Aware Formatting:
- [ ] Dates formatted per locale (MM/DD/YYYY vs DD/MM/YYYY)
- [ ] Numbers formatted per locale (1,000.00 vs 1.000,00)
- [ ] Currency symbols positioned correctly
- [ ] Time zones handled properly
- [ ] Pluralization rules per language

```typescript
// Required locale formatting
const formatters = {
  date: new Intl.DateTimeFormat(locale),
  number: new Intl.NumberFormat(locale),
  currency: new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }),
  relativeTime: new Intl.RelativeTimeFormat(locale),
};
```

#### Translation Management:
- [ ] All UI strings externalized (no hardcoded text)
- [ ] Translation keys namespaced systematically
- [ ] Fallback language defined (usually English)
- [ ] Variable interpolation in translations
- [ ] Gender/plural support in translations

#### Text Expansion Tolerance:
- [ ] UI components accommodate 30-50% text expansion
- [ ] No text truncation for critical information
- [ ] Buttons don't break with longer text
- [ ] Forms remain usable with translated labels

---

### 1.6 DATA COMPLIANCE AUDIT

**ACTION**: GDPR, CCPA, and international privacy compliance.

#### Data Collection Transparency:
- [ ] Cookie consent banner (required, not pre-checked)
- [ ] Privacy policy link in footer
- [ ] Terms of service link in footer
- [ ] Data processing disclosure on forms
- [ ] Third-party data sharing disclosed

#### User Data Rights:
- [ ] Right to access personal data
- [ ] Right to download data (data portability)
- [ ] Right to delete account and data
- [ ] Right to opt-out of marketing
- [ ] Right to correct inaccurate data

#### Cookie Management:
```typescript
// Required cookie categories
const COOKIE_CATEGORIES = {
  necessary: {
    required: true,
    description: 'Essential for site functionality',
  },
  analytics: {
    required: false,
    description: 'Help us understand usage patterns',
  },
  marketing: {
    required: false,
    description: 'Used for personalized advertising',
  },
  preferences: {
    required: false,
    description: 'Remember your settings and preferences',
  },
};
```

#### Data Retention:
- [ ] Clear retention policies defined
- [ ] Automatic data deletion after retention period
- [ ] User notified before data deletion
- [ ] Audit logs for data access

#### Security Measures:
- [ ] HTTPS enforced everywhere
- [ ] Secure cookie flags (HttpOnly, Secure, SameSite)
- [ ] CSP headers implemented
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting on sensitive endpoints

---

## PHASE 2: DESIGN TOKEN IMPLEMENTATION

### 2.1 TOKEN ARCHITECTURE

**ACTION**: Create comprehensive token system with CSS Variables and JavaScript objects.

#### File Structure:
```
src/design-system/
├── tokens/
│   ├── primitives/           # Base values (colors, scales)
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── breakpoints.ts
│   │   └── index.ts
│   ├── semantic/             # Purpose-driven tokens
│   │   ├── colors.ts         # primary, success, error, etc.
│   │   ├── spacing.ts        # component-specific
│   │   ├── typography.ts     # heading, body, caption
│   │   └── index.ts
│   ├── themes/               # Theme variations
│   │   ├── light.ts
│   │   ├── dark.ts
│   │   ├── high-contrast.ts
│   │   └── index.ts
│   └── index.ts              # Central export
```

#### Token Definition Template:

```typescript
// src/design-system/tokens/primitives/colors.ts

/**
 * Primitive Color Tokens
 * Base color palette - do not use directly in components
 * Use semantic tokens instead for better maintainability
 */

export const primitiveColors = {
  // Neutral scale (0-950)
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Brand colors
  brand: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',    // Primary brand
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
  
  // Semantic color bases
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    900: '#14532D',
  },
  
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    900: '#7F1D1D',
  },
  
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    900: '#78350F',
  },
  
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    900: '#1E3A8A',
  },
} as const;

// Type safety for token access
export type PrimitiveColor = typeof primitiveColors;
```

```typescript
// src/design-system/tokens/semantic/colors.ts

import { primitiveColors } from '../primitives/colors';

/**
 * Semantic Color Tokens
 * Purpose-driven color assignments
 * Components should ONLY use these, never primitive colors
 */

export const semanticColors = {
  // Interactive elements
  interactive: {
    primary: {
      default: primitiveColors.brand[500],
      hover: primitiveColors.brand[600],
      active: primitiveColors.brand[700],
      disabled: primitiveColors.neutral[300],
    },
    secondary: {
      default: primitiveColors.neutral[600],
      hover: primitiveColors.neutral[700],
      active: primitiveColors.neutral[800],
      disabled: primitiveColors.neutral[300],
    },
  },
  
  // Status indicators
  status: {
    success: {
      default: primitiveColors.success[500],
      bg: primitiveColors.success[50],
      border: primitiveColors.success[500],
    },
    error: {
      default: primitiveColors.error[500],
      bg: primitiveColors.error[50],
      border: primitiveColors.error[500],
    },
    warning: {
      default: primitiveColors.warning[500],
      bg: primitiveColors.warning[50],
      border: primitiveColors.warning[500],
    },
    info: {
      default: primitiveColors.info[500],
      bg: primitiveColors.info[50],
      border: primitiveColors.info[500],
    },
  },
  
  // Text colors
  text: {
    primary: primitiveColors.neutral[900],
    secondary: primitiveColors.neutral[600],
    tertiary: primitiveColors.neutral[500],
    disabled: primitiveColors.neutral[400],
    inverse: primitiveColors.neutral[0],
    brand: primitiveColors.brand[500],
    success: primitiveColors.success[900],
    error: primitiveColors.error[900],
  },
  
  // Surface colors
  surface: {
    primary: primitiveColors.neutral[0],
    secondary: primitiveColors.neutral[50],
    tertiary: primitiveColors.neutral[100],
    raised: primitiveColors.neutral[0],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Border colors
  border: {
    default: primitiveColors.neutral[200],
    strong: primitiveColors.neutral[300],
    subtle: primitiveColors.neutral[100],
    brand: primitiveColors.brand[500],
    focus: primitiveColors.brand[500],
  },
} as const;

export type SemanticColors = typeof semanticColors;
```

```typescript
// src/design-system/tokens/primitives/spacing.ts

/**
 * Spacing Tokens
 * Based on 4px grid system
 * Use these for all margin, padding, gap, and positioning
 */

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px
} as const;

export type Spacing = keyof typeof spacing;
```

```typescript
// src/design-system/tokens/primitives/typography.ts

/**
 * Typography Tokens
 * Font families, sizes, weights, and related properties
 */

export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), system-ui, -apple-system, sans-serif',
    serif: 'var(--font-merriweather), Georgia, serif',
    mono: 'var(--font-jetbrains-mono), Consolas, monospace',
    display: 'var(--font-display), system-ui, sans-serif',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export type Typography = typeof typography;
```

```typescript
// src/design-system/tokens/themes/light.ts

import { semanticColors } from '../semantic/colors';
import { spacing } from '../primitives/spacing';
import { typography } from '../primitives/typography';

/**
 * Light Theme
 * Default theme configuration
 */

export const lightTheme = {
  colors: semanticColors,
  spacing,
  typography,
  
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  },
  
  borderWidth: {
    0: '0',
    default: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  
  transitions: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
} as const;

export type Theme = typeof lightTheme;
```

#### CSS Variables Export:

```css
/* src/design-system/tokens/tokens.css */

:root {
  /* Spacing */
  --space-0: 0;
  --space-px: 1px;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  
  /* Colors - Semantic */
  --color-primary: #6366F1;
  --color-primary-hover: #4F46E5;
  --color-primary-active: #4338CA;
  
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-text-tertiary: #6B7280;
  --color-text-disabled: #9CA3AF;
  
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-tertiary: #F3F4F6;
  
  --color-border-default: #E5E7EB;
  --color-border-strong: #D1D5DB;
  --color-border-focus: #6366F1;
  
  /* Typography */
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  
  /* Transitions */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Z-Index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-tooltip: 1070;
}

/* Dark theme */
[data-theme="dark"] {
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  --color-text-tertiary: #9CA3AF;
  
  --color-bg-primary: #111827;
  --color-bg-secondary: #1F2937;
  --color-bg-tertiary: #374151;
  
  --color-border-default: #374151;
  --color-border-strong: #4B5563;
}

/* RTL support */
[dir="rtl"] {
  /* Automatically handled by logical properties */
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --color-border-default: #000000;
    --color-text-secondary: #000000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-base: 0ms;
    --duration-slow: 0ms;
  }
}
```

---

### 2.2 COMPONENT TOKEN USAGE ENFORCEMENT

**ACTION**: Every component must consume tokens exclusively.

#### Component Implementation Rules:

```typescript
// ❌ FORBIDDEN - Hardcoded values
export const Button = ({ children }) => (
  <button
    style={{
      padding: '12px 24px',
      backgroundColor: '#6366F1',
      color: '#FFFFFF',
      borderRadius: '8px',
      fontSize: '14px',
    }}
  >
    {children}
  </button>
);

// ✅ REQUIRED - Token-based with variants
import { tokens } from '@/design-system/tokens';

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
    <button className={styles.button} data-variant={variant} data-size={size}>
      {children}
    </button>
  );
};

// styles.module.css
.button {
  /* Base styles using tokens */
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-out);
  border: var(--border-width-default) solid transparent;
  cursor: pointer;
  
  /* Ensure accessibility */
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

.button[data-variant="secondary"] {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
  
  &:hover:not(:disabled) {
    background-color: var(--color-bg-secondary);
  }
}
```

---

## PHASE 3: RESPONSIVE IMPLEMENTATION

### 3.1 BREAKPOINT SYSTEM

**ACTION**: Implement fluid, mobile-first responsive design.

```typescript
// src/design-system/tokens/primitives/breakpoints.ts

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
} as const;

// Media query helpers
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  '3xl': `@media (min-width: ${breakpoints['3xl']})`,
} as const;
```

```css
/* Mobile-first responsive patterns */

.container {
  /* Mobile base (320px+) */
  padding-inline: var(--space-4);
  max-width: 100%;
  
  /* Tablet (768px+) */
  @media (min-width: 768px) {
    padding-inline: var(--space-6);
    max-width: 768px;
    margin-inline: auto;
  }
  
  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    padding-inline: var(--space-8);
    max-width: 1024px;
  }
  
  /* Large desktop (1280px+) */
  @media (min-width: 1280px) {
    max-width: 1280px;
  }
}

/* Responsive grid */
.grid {
  display: grid;
  gap: var(--space-4);
  
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
  
  /* Tablet: 2 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
  
  /* Desktop: 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
}

/* Responsive typography */
.heading {
  /* Mobile */
  font-size: var(--font-size-2xl);
  line-height: var(--line-height-tight);
  
  /* Tablet */
  @media (min-width: 768px) {
    font-size: var(--font-size-3xl);
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    font-size: var(--font-size-4xl);
  }
}

/* Responsive spacing using clamp() for fluid scaling */
.section {
  padding-block: clamp(var(--space-8), 5vw, var(--space-16));
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}
```

### 3.2 CONTAINER QUERIES (Modern Approach)

```css
/* Component-level responsiveness */

.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: var(--space-4);
  
  /* When container is >400px */
  @container card (min-width: 400px) {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-6);
  }
  
  /* When container is >600px */
  @container card (min-width: 600px) {
    padding: var(--space-6);
  }
}
```

---

## PHASE 4: ACCESSIBILITY IMPLEMENTATION

### 4.1 FOCUS MANAGEMENT SYSTEM

```typescript
// src/design-system/utils/focus-management.ts

/**
 * Focus Management Utilities
 * Handle focus trapping, restoration, and keyboard navigation
 */

export class FocusManager {
  private previousFocus: HTMLElement | null = null;
  
  /**
   * Trap focus within a container (for modals, dialogs)
   */
  trapFocus(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
  
  /**
   * Save current focus to restore later
   */
  saveFocus() {
    this.previousFocus = document.activeElement as HTMLElement;
  }
  
  /**
   * Restore previously saved focus
   */
  restoreFocus() {
    this.previousFocus?.focus();
    this.previousFocus = null;
  }
  
  /**
   * Get all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    
    return Array.from(container.querySelectorAll(selector));
  }
}
```

### 4.2 ARIA PATTERNS IMPLEMENTATION

```typescript
// src/design-system/components/Modal/Modal.tsx

import { useEffect, useRef } from 'react';
import { FocusManager } from '@/design-system/utils/focus-management';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children 
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const focusManager = useRef(new FocusManager());
  
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    // Save current focus
    focusManager.current.saveFocus();
    
    // Trap focus within modal
    const cleanup = focusManager.current.trapFocus(modalRef.current);
    
    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
      focusManager.current.restoreFocus();
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={styles.modal}
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className={styles.closeButton}
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>
        
        {description && (
          <p id="modal-description" className={styles.description}>
            {description}
          </p>
        )}
        
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
};
```

### 4.3 KEYBOARD NAVIGATION PATTERNS

```typescript
// src/design-system/components/Tabs/Tabs.tsx

/**
 * Accessible Tabs Component
 * Implements ARIA Tabs pattern with keyboard navigation
 */

export const Tabs = ({ items, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0].id);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  const handleKeyDown = (e: KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    const newTab = items[newIndex];
    setActiveTab(newTab.id);
    tabRefs.current.get(newTab.id)?.focus();
  };
  
  return (
    <div className={styles.tabs}>
      {/* Tab List */}
      <div role="tablist" aria-label="Content tabs" className={styles.tabList}>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => el && tabRefs.current.set(item.id, el)}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={activeTab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={activeTab === item.id ? 0 : -1}
            onClick={() => setActiveTab(item.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={styles.tab}
            data-active={activeTab === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      
      {/* Tab Panels */}
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`panel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          hidden={activeTab !== item.id}
          tabIndex={0}
          className={styles.panel}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};
```

---

## PHASE 5: INTERNATIONALIZATION IMPLEMENTATION

### 5.1 RTL SUPPORT WITH LOGICAL PROPERTIES

```css
/* Enforce logical properties throughout */

/* ❌ FORBIDDEN */
.element {
  margin-left: var(--space-4);
  padding-right: var(--space-6);
  border-left: 1px solid;
  text-align: left;
}

/* ✅ REQUIRED */
.element {
  margin-inline-start: var(--space-4);
  padding-inline-end: var(--space-6);
  border-inline-start: 1px solid var(--color-border-default);
  text-align: start;
}

/* Directional icons that need flipping */
.icon-arrow {
  /* Default LTR */
  transform: rotate(0deg);
  
  /* RTL - flip horizontally */
  [dir="rtl"] & {
    transform: scaleX(-1);
  }
}

/* Animations that need direction adjustment */
.slide-in {
  animation: slideInFromLeft var(--duration-base) var(--easing-out);
  
  [dir="rtl"] & {
    animation: slideInFromRight var(--duration-base) var(--easing-out);
  }
}

@keyframes slideInFromLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slideInFromRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

### 5.2 TRANSLATION SYSTEM

```typescript
// src/i18n/config.ts

export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'ja', 'ar', 'he'],
  
  // Locale metadata
  localeMetadata: {
    en: { direction: 'ltr', name: 'English' },
    es: { direction: 'ltr', name: 'Español' },
    fr: { direction: 'ltr', name: 'Français' },
    de: { direction: 'ltr', name: 'Deutsch' },
    ja: { direction: 'ltr', name: '日本語' },
    ar: { direction: 'rtl', name: 'العربية' },
    he: { direction: 'rtl', name: 'עברית' },
  },
} as const;

// src/i18n/translations/en.json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "confirm": "Confirm"
    },
    "labels": {
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort"
    },
    "messages": {
      "loading": "Loading...",
      "error": "An error occurred",
      "success": "Operation successful",
      "noResults": "No results found"
    }
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "settings": "Settings",
    "profile": "Profile"
  },
  "forms": {
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email",
      "minLength": "Must be at least {{min}} characters",
      "maxLength": "Must be no more than {{max}} characters"
    }
  }
}

// Usage in components
import { useTranslation } from 'next-i18next';

export const MyComponent = () => {
  const { t, i18n } = useTranslation('common');
  
  return (
    <div dir={i18n.dir()}>
      <button>{t('buttons.save')}</button>
      <p>{t('forms.validation.minLength', { min: 8 })}</p>
    </div>
  );
};
```

### 5.3 LOCALE-AWARE FORMATTING

```typescript
// src/utils/formatters.ts

/**
 * Locale-aware formatting utilities
 */

export class Formatters {
  private locale: string;
  
  constructor(locale: string) {
    this.locale = locale;
  }
  
  /**
   * Format date according to locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: 'medium',
      ...options,
    }).format(date);
  }
  
  /**
   * Format number according to locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }
  
  /**
   * Format currency according to locale
   */
  formatCurrency(
    value: number, 
    currency: string = 'USD',
    options?: Intl.NumberFormatOptions
  ): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
      ...options,
    }).format(value);
  }
  
  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(
    value: number, 
    unit: Intl.RelativeTimeFormatUnit
  ): string {
    return new Intl.RelativeTimeFormat(this.locale, {
      numeric: 'auto',
    }).format(value, unit);
  }
  
  /**
   * Format list according to locale
   */
  formatList(items: string[], options?: Intl.ListFormatOptions): string {
    return new Intl.ListFormat(this.locale, {
      style: 'long',
      type: 'conjunction',
      ...options,
    }).format(items);
  }
}

// Usage
const formatters = new Formatters('en-US');
formatters.formatDate(new Date()); // "Jan 15, 2025"
formatters.formatCurrency(1234.56); // "$1,234.56"
formatters.formatRelativeTime(-2, 'hours'); // "2 hours ago"
```

---

## PHASE 6: DATA COMPLIANCE IMPLEMENTATION

### 6.1 COOKIE CONSENT SYSTEM

```typescript
// src/components/CookieConsent/CookieConsent.tsx

/**
 * GDPR/CCPA Compliant Cookie Consent Banner
 */

import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,  // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });
  
  useEffect(() => {
    // Check if user has already made a choice
    const savedPreferences = localStorage.getItem('cookie-preferences');
    if (!savedPreferences) {
      setIsVisible(true);
    }
  }, []);
  
  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
    setIsVisible(false);
  };
  
  const handleAcceptSelected = () => {
    savePreferences(preferences);
    setIsVisible(false);
  };
  
  const handleRejectAll = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    savePreferences(necessaryOnly);
    setIsVisible(false);
  };
  
  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    
    // Initialize analytics if accepted
    if (prefs.analytics) {
      initializeAnalytics();
    }
    
    // Initialize marketing if accepted
    if (prefs.marketing) {
      initializeMarketing();
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={styles.banner}
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-description"
    >
      <div className={styles.content}>
        <h2 className={styles.title}>Cookie Preferences</h2>
        
        <p id="cookie-description" className={styles.description}>
          We use cookies to enhance your experience, analyze site traffic, and 
          personalize content. You can customize your preferences below.
        </p>
        
        {showDetails && (
          <div className={styles.details}>
            <div className={styles.category}>
              <label className={styles.categoryLabel}>
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  aria-label="Necessary cookies (required)"
                />
                <div>
                  <strong>Necessary Cookies</strong>
                  <p>Essential for the website to function. Cannot be disabled.</p>
                </div>
              </label>
            </div>
            
            <div className={styles.category}>
              <label className={styles.categoryLabel}>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => 
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  aria-label="Analytics cookies"
                />
                <div>
                  <strong>Analytics Cookies</strong>
                  <p>Help us understand how visitors use our website.</p>
                </div>
              </label>
            </div>
            
            <div className={styles.category}>
              <label className={styles.categoryLabel}>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => 
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                  aria-label="Marketing cookies"
                />
                <div>
                  <strong>Marketing Cookies</strong>
                  <p>Used to deliver personalized advertisements.</p>
                </div>
              </label>
            </div>
            
            <div className={styles.category}>
              <label className={styles.categoryLabel}>
                <input
                  type="checkbox"
                  checked={preferences.preferences}
                  onChange={(e) => 
                    setPreferences({ ...preferences, preferences: e.target.checked })
                  }
                  aria-label="Preference cookies"
                />
                <div>
                  <strong>Preference Cookies</strong>
                  <p>Remember your settings and preferences.</p>
                </div>
              </label>
            </div>
          </div>
        )}
        
        <div className={styles.actions}>
          <button 
            onClick={handleAcceptAll}
            className={styles.buttonPrimary}
          >
            Accept All
          </button>
          
          <button 
            onClick={handleRejectAll}
            className={styles.buttonSecondary}
          >
            Reject All
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={styles.buttonSecondary}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
          
          {showDetails && (
            <button 
              onClick={handleAcceptSelected}
              className={styles.buttonPrimary}
            >
              Save Preferences
            </button>
          )}
        </div>
        
        <p className={styles.footer}>
          <a href="/privacy-policy">Privacy Policy</a>
          {' • '}
          <a href="/cookie-policy">Cookie Policy</a>
        </p>
      </div>
    </div>
  );
};
```

### 6.2 DATA PRIVACY UTILITIES

```typescript
// src/utils/privacy.ts

/**
 * Data Privacy Utilities
 * GDPR/CCPA compliance helpers
 */

export class PrivacyManager {
  /**
   * Check if user has consented to specific cookie category
   */
  static hasConsent(category: keyof CookiePreferences): boolean {
    const preferences = this.getPreferences();
    return preferences?.[category] ?? false;
  }
  
  /**
   * Get saved cookie preferences
   */
  static getPreferences(): CookiePreferences | null {
    const saved = localStorage.getItem('cookie-preferences');
    return saved ? JSON.parse(saved) : null;
  }
  
  /**
   * Anonymize IP address for GDPR compliance
   */
  static anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      // IPv4: Replace last octet
      return `${parts.slice(0, 3).join('.')}.0`;
    }
    // IPv6: Truncate last 80 bits
    const ipv6Parts = ip.split(':');
    return ipv6Parts.slice(0, 4).join(':') + '::';
  }
  
  /**
   * Generate data export for user (GDPR Article 20 - Data Portability)
   */
  static async generateDataExport(userId: string): Promise<Blob> {
    const userData = await fetchUserData(userId);
    const jsonData = JSON.stringify(userData, null, 2);
    return new Blob([jsonData], { type: 'application/json' });
  }
  
  /**
   * Delete all user data (Right to Erasure - GDPR Article 17)
   */
  static async deleteUserData(userId: string): Promise<void> {
    // Delete from all systems
    await Promise.all([
      deleteFromDatabase(userId),
      deleteFromAnalytics(userId),
      deleteFromCDN(userId),
      deleteFromBackups(userId),
    ]);
    
    // Log deletion for audit trail (required to be kept)
    await logDataDeletion(userId, new Date());
  }
  
  /**
   * Pseudonymize user data for analytics
   */
  static pseudonymize(data: any): any {
    const pseudo = { ...data };
    
    // Remove or hash PII
    if (pseudo.email) {
      pseudo.email = this.hashPII(pseudo.email);
    }
    if (pseudo.name) {
      delete pseudo.name;
    }
    if (pseudo.phone) {
      delete pseudo.phone;
    }
    if (pseudo.address) {
      delete pseudo.address;
    }
    
    return pseudo;
  }
  
  /**
   * Hash PII for pseudonymization
   */
  private static async hashPII(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
```

---

## PHASE 7: CONTINUOUS MONITORING & ENFORCEMENT

### 7.1 AUTOMATED LINTING RULES

```javascript
// .eslintrc.js

module.exports = {
  rules: {
    // Prohibit hardcoded colors
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/#[0-9A-Fa-f]{3,8}/]",
        message: 'Hardcoded hex colors are not allowed. Use design tokens instead.',
      },
      {
        selector: "CallExpression[callee.name='rgb']",
        message: 'RGB colors are not allowed. Use design tokens instead.',
      },
      {
        selector: "CallExpression[callee.name='rgba']",
        message: 'RGBA colors are not allowed. Use design tokens instead.',
      },
    ],
    
    // Prohibit hardcoded spacing
    'no-magic-numbers': [
      'error',
      { 
        ignore: [0, 1, -1], 
        enforceConst: true,
        message: 'Use design tokens for spacing values',
      },
    ],
    
    // Require ARIA attributes
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    
    // Keyboard accessibility
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    
    // Alt text requirements
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    
    // i18n requirements
    'no-literal-string': ['error', { 
      message: 'Use translation keys instead of hardcoded strings' 
    }],
  },
};
```

### 7.2 DESIGN TOKEN VALIDATOR

```typescript
// scripts/validate-tokens.ts

/**
 * Validates that all components use design tokens
 * Run in CI/CD pipeline
 */

import fs from 'fs';
import path from 'path';

interface ValidationError {
  file: string;
  line: number;
  violation: string;
  suggestion: string;
}

const FORBIDDEN_PATTERNS = [
  // Hardcoded colors
  { 
    pattern: /#[0-9A-Fa-f]{3,8}/g, 
    name: 'hardcoded hex color',
    suggestion: 'Use var(--color-*) or semantic color token',
  },
  { 
    pattern: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g, 
    name: 'hardcoded RGB color',
    suggestion: 'Use var(--color-*) or semantic color token',
  },
  
  // Hardcoded spacing (px values)
  { 
    pattern: /:\s*\d+px/g, 
    name: 'hardcoded pixel spacing',
    suggestion: 'Use var(--space-*) token or rem units',
  },
  
  // Hardcoded font sizes
  { 
    pattern: /font-size:\s*\d+/g, 
    name: 'hardcoded font size',
    suggestion: 'Use var(--font-size-*) token',
  },
  
  // Directional properties (should use logical)
  { 
    pattern: /(margin|padding)-(left|right):/g, 
    name: 'directional property (not RTL-friendly)',
    suggestion: 'Use margin-inline-start or margin-inline-end',
  },
];

function validateFile(filePath: string): ValidationError[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors: ValidationError[] = [];
  
  lines.forEach((line, index) => {
    FORBIDDEN_PATTERNS.forEach(({ pattern, name, suggestion }) => {
      if (pattern.test(line)) {
        errors.push({
          file: filePath,
          line: index + 1,
          violation: name,
          suggestion,
        });
      }
    });
  });
  
  return errors;
}

function validateDirectory(dirPath: string): ValidationError[] {
  let allErrors: ValidationError[] = [];
  
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.')) {
      allErrors = allErrors.concat(validateDirectory(fullPath));
    } else if (file.name.match(/\.(css|scss|tsx|jsx)$/)) {
      allErrors = allErrors.concat(validateFile(fullPath));
    }
  });
  
  return allErrors;
}

// Run validation
const srcPath = path.join(process.cwd(), 'src');
const errors = validateDirectory(srcPath);

if (errors.length > 0) {
  console.error('\n❌ Design Token Violations Found:\n');
  errors.forEach(error => {
    console.error(`${error.file}:${error.line}`);
    console.error(`  Violation: ${error.violation}`);
    console.error(`  Suggestion: ${error.suggestion}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ All files comply with design token requirements');
  process.exit(0);
}
```

### 7.3 ACCESSIBILITY TESTING AUTOMATION

```typescript
// tests/accessibility.test.ts

/**
 * Automated accessibility testing
 * Run on all components and pages
 */

import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button component has no accessibility violations', async () => {
    const { container } = render(
      <Button variant="primary" size="md">
        Click me
      </Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('Modal component has proper ARIA attributes', async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Verify specific ARIA attributes
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });
  
  it('Form has proper labels and error messages', async () => {
    const { container } = render(
      <Form>
        <Input label="Email" type="email" error="Invalid email" />
      </Form>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Visual regression testing for focus states
describe('Focus State Visual Tests', () => {
  it('Button has visible focus indicator', async () => {
    const { container } = render(<Button>Focus test</Button>);
    
    const button = container.querySelector('button');
    button?.focus();
    
    // Check for focus outline
    const styles = window.getComputedStyle(button!);
    expect(styles.outline).not.toBe('none');
  });
});
```

---

## DELIVERABLES CHECKLIST

Upon completion, you MUST provide:

### 📋 Audit Report
- [ ] Complete token inventory with gap analysis
- [ ] Component classification (Atoms → Pages)
- [ ] Responsive behavior test results across all breakpoints
- [ ] Accessibility audit results (WCAG 2.2 AAA)
- [ ] i18n readiness assessment
- [ ] Data compliance verification

### 🏗️ Implementation Artifacts
- [ ] Complete token system (primitives + semantic + themes)
- [ ] CSS variables file with all tokens exported
- [ ] TypeScript types for type-safe token consumption
- [ ] Component library with zero hardcoded values
- [ ] Responsive utilities and container query setup
- [ ] Accessibility utilities (focus management, ARIA helpers)
- [ ] i18n configuration and translation infrastructure
- [ ] Cookie consent and privacy management system

### 🧪 Testing Suite
- [ ] Token validation script (CI/CD integration)
- [ ] ESLint rules enforcing token usage
- [ ] Accessibility test suite (jest-axe)
- [ ] Visual regression tests for responsive behavior
- [ ] Keyboard navigation tests
- [ ] RTL layout tests

### 📚 Documentation
- [ ] Design token reference guide
- [ ] Component usage documentation with examples
- [ ] Accessibility implementation guide
- [ ] i18n implementation guide
- [ ] Responsive design guidelines
- [ ] Contribution guidelines (for maintaining standards)

---

## SUCCESS CRITERIA

This implementation is considered successful when:

✅ **Zero Hardcoded Values**: No hex colors, pixel values, or magic numbers anywhere in codebase  
✅ **Full Responsiveness**: All layouts and components work flawlessly from 320px to 3840px  
✅ **AAA Accessibility**: WCAG 2.2 AAA compliance across all components and pages  
✅ **International Ready**: RTL support, locale-aware formatting, translation system operational  
✅ **Privacy Compliant**: GDPR/CCPA cookie consent, data rights implementation, secure by default  
✅ **Maintainable**: Design system as single source of truth, atomic component structure  
✅ **Performant**: No style recalculations, optimized CSS, minimal runtime overhead  
✅ **Type-Safe**: Full TypeScript coverage for all design tokens and components  
✅ **Automated**: CI/CD validation, linting enforcement, accessibility testing

---

## FINAL NOTES

This is not a one-time implementation but an **ongoing system architecture**. Every new component, feature, or page must adhere to these principles. The design system is the foundation—it must be protected, enhanced, and evolved, but never circumvented.

**Remember**: Hardcoded values are technical debt. Accessibility is not optional. Responsive design is not a feature—it's a requirement. International support is not an afterthought—it's architected from the start.

Build systems, not quick fixes. This is enterprise-grade work.

---

**End of Prompt Framework**

Generated for: ATLVS Application  
Standards: WCAG 2.2 AAA, GDPR/CCPA Compliant, Mobile-First Responsive  
Last Updated: November 2025
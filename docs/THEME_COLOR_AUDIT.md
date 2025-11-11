# Theme Color Audit & Remediation

## Critical Issue Fixed

Components were using `var(--color-text-inverse)` and hardcoded `var(--color-black)`/`var(--color-white)` values that don't adapt to theme changes, causing invisible text and broken UI in dark mode.

## Root Cause

The design tokens define:
- **Light theme**: `--color-text-inverse: #FFFFFF` (white)
- **Dark theme**: `--color-text-inverse: #000000` (black)

When components use `var(--color-text-inverse)` on a fixed black background, the text becomes invisible in dark mode.

## Fixed Components

1. ✅ **CookieConsent** - Banner now adapts: black bg/white text (light) → white bg/black text (dark)
2. ✅ **NewsletterSignup** - Inverted section now adapts properly
3. ✅ **AuthLayout** - Decorative patterns now use theme-aware colors
4. ✅ **AdminLayout** - Scrollbar colors now adapt to theme
5. ✅ **ErrorLayout** - Warning stripes now use theme-aware colors
6. ✅ **auth.module.css** - Focus outlines now adapt to theme

## Semantic Token Usage

### Use These for Theme-Aware Components:
- `var(--color-text-primary)` - Main text color (black in light, white in dark)
- `var(--color-bg-primary)` - Main background (white in light, black in dark)
- `var(--color-text-secondary)` - Secondary text (adapts to theme)
- `var(--color-bg-secondary)` - Secondary background (adapts to theme)

### Use These ONLY for Intentionally Fixed Colors:
- `var(--color-black)` - Literal black in BOTH themes
- `var(--color-white)` - Literal white in BOTH themes

## Components Requiring Manual Review

### High Priority (Likely Broken in Dark Mode)

**Status Badges & Indicators:**
- `StatusBadge.module.css` - Multiple variants with `background-color: var(--color-black)`
- `Badge.module.css` - Filled variant with fixed black background
- `WristbandType.module.css` - VIP variant with fixed colors
- `Tag.module.css` - Filled variant
- `StageLabel.module.css` - Primary variant
- `AgeRating.module.css` - 21+ variant

**Question:** Should these badges invert in dark mode, or stay black/white for brand consistency?

**Interactive Components:**
- `Button.module.css` - Filled/CTA variants with `background-color: var(--color-black)`
- `Link.module.css` - Button variant hover state
- `CTAButton.module.css` - Multiple hover states
- `QuantitySelector.module.css` - Button hover states
- `DownloadButton.module.css` - Fixed black background

**Question:** Should buttons invert (black→white in dark mode) or maintain fixed colors?

**Form Components:**
- `Radio.module.css` - Checked state with `background-color: var(--color-black)`
- `Switch.module.css` - Checked state and thumb
- `Toggle.module.css` - Checked state
- `Slider.module.css` - Track fill

**Question:** Should form controls invert or maintain consistent appearance?

**Data Visualization:**
- `ProgressBar.module.css` - Fill color
- `CapacityIndicator.module.css` - Fill color
- `ScrollIndicator.module.css` - Progress color
- `LoadingSpinner.module.css` - Block/bar/pulse colors

**Question:** Should progress indicators invert or stay consistent?

**Layout Components:**
- `Table.module.css` - Header with `background-color: var(--color-black)`
- `Modal.module.css` - Background and border
- `Overlay.module.css` - Fixed black background

**Question:** Should table headers invert? Should modals adapt to theme?

### Medium Priority (May Need Adjustment)

**Complex Components:**
- `DataTable.module.css` - Multiple fixed colors
- `KPIDashboard.module.css` - Card backgrounds and status indicators
- `IncidentBoard.module.css` - Card and button backgrounds
- `AdvancedFilter.module.css` - Multiple form elements
- `GalleryView.module.css` - Search bar and cards
- `CapacityMonitor.module.css` - Status badges and progress fills

### Low Priority (Decorative/Subtle)

**Decorative Elements:**
- `GeometricShape.module.css` - Filled variant
- `List.module.css` - Bullet points
- `SocialIcon.module.css` - Hover state

## Decision Framework

For each component, ask:

1. **Is this a brand element?** (logos, specific badges)
   - YES → Keep fixed colors (`var(--color-black)`, `var(--color-white)`)
   - NO → Continue to question 2

2. **Does it need to contrast with page background?**
   - YES → Use theme-aware tokens (`var(--color-text-primary)`, `var(--color-bg-primary)`)
   - NO → Continue to question 3

3. **Is it intentionally inverted from the page?** (newsletter sections, call-to-actions)
   - YES → Use inverted theme tokens (bg uses text color, text uses bg color)
   - NO → Use standard theme tokens

## Recommended Approach

1. **Test in both themes** - View each component in light and dark mode
2. **Check contrast** - Ensure text is always readable
3. **Maintain hierarchy** - Visual importance should be consistent across themes
4. **Consider brand** - Some elements may need fixed colors for brand consistency

## Next Steps

1. Review each component category with design team
2. Decide on theme behavior for each component type
3. Systematically update components following the decision framework
4. Add theme switching tests to prevent regressions

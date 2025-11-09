# Atomic Design System - Directory Structure

## Overview
This document defines the optimized directory structure for GVTEWAY following atomic design principles. All components are organized by their atomic hierarchy: Atoms → Molecules → Organisms → Templates → Pages.

## Directory Structure

```
src/
├── design-system/           # Design system foundation
│   ├── tokens/              # Design tokens (primitives, semantic, themes)
│   │   ├── primitives/      # Base values (colors, spacing, typography)
│   │   ├── semantic/        # Purpose-driven tokens
│   │   ├── themes/          # Theme variations (light, dark, high-contrast)
│   │   ├── tokens.css       # CSS variables export
│   │   ├── utility-classes.css  # Token-based utility classes
│   │   └── index.ts         # TypeScript exports
│   ├── utils/               # Design system utilities
│   │   ├── focus-management.ts
│   │   ├── aria-helpers.ts
│   │   └── keyboard-navigation.ts
│   └── components/          # Atomic components (NEW STRUCTURE)
│       ├── atoms/           # Foundational, indivisible elements
│       │   ├── Button/
│       │   │   ├── Button.tsx
│       │   │   ├── Button.module.css
│       │   │   ├── Button.test.tsx
│       │   │   └── index.ts
│       │   ├── Input/
│       │   ├── Label/
│       │   ├── Icon/
│       │   ├── Badge/
│       │   ├── Avatar/
│       │   ├── Spinner/
│       │   ├── Divider/
│       │   ├── Checkbox/
│       │   ├── Radio/
│       │   ├── Toggle/
│       │   ├── Progress/
│       │   ├── Skeleton/
│       │   └── Link/
│       ├── molecules/       # Simple component groups
│       │   ├── FormField/
│       │   ├── SearchBar/
│       │   ├── CardHeader/
│       │   ├── ListItem/
│       │   ├── BreadcrumbItem/
│       │   ├── TabItem/
│       │   ├── AccordionItem/
│       │   ├── MenuItem/
│       │   ├── NotificationItem/
│       │   ├── AvatarWithStatus/
│       │   ├── ButtonGroup/
│       │   └── StatCard/
│       ├── organisms/       # Complex component assemblies
│       │   ├── Navigation/
│       │   ├── Sidebar/
│       │   ├── DataTable/
│       │   ├── Form/
│       │   ├── Modal/
│       │   ├── Card/
│       │   ├── Hero/
│       │   ├── FeatureGrid/
│       │   ├── PricingTable/
│       │   ├── Footer/
│       │   ├── SearchResults/
│       │   ├── CommentThread/
│       │   └── FileUpload/
│       ├── templates/       # Page-level compositions
│       │   ├── DashboardLayout/
│       │   ├── AuthLayout/
│       │   ├── SettingsLayout/
│       │   ├── DetailLayout/
│       │   ├── ListLayout/
│       │   ├── LandingLayout/
│       │   ├── ErrorLayout/
│       │   └── EmptyStateLayout/
│       └── pages/           # Fully populated instances
│           └── (Handled by Next.js app directory)
│
├── components/              # Feature-specific components (CURRENT STRUCTURE)
│   ├── admin/               # Admin-specific components
│   ├── features/            # Feature modules
│   │   ├── events/
│   │   ├── artists/
│   │   ├── shop/
│   │   ├── ticketing/
│   │   ├── membership/
│   │   ├── messaging/
│   │   └── content/
│   ├── membership/          # Membership-specific components
│   ├── privacy/             # Privacy & compliance components
│   └── ui/                  # Shared UI components (TO BE MIGRATED)
│
├── app/                     # Next.js app directory (Pages)
├── lib/                     # Business logic & utilities
├── hooks/                   # React hooks
├── i18n/                    # Internationalization
└── types/                   # TypeScript types
```

## Migration Strategy

### Phase 1: Create Atomic Structure (COMPLETED)
- ✅ Created `design-system/tokens/` with comprehensive token system
- ✅ Created `design-system/utils/` with accessibility utilities
- ✅ Set up CSS modules for token-based styling

### Phase 2: Migrate Components by Atomic Level

#### Atoms (Foundational)
**Current Location**: `src/components/ui/`
**Target**: `src/design-system/components/atoms/`

Components to migrate:
- button.tsx → Button/
- input.tsx → Input/
- label.tsx → Label/
- badge.tsx → Badge/
- avatar.tsx → Avatar/
- checkbox.tsx → Checkbox/
- radio.tsx → Radio/
- switch.tsx → Toggle/
- progress.tsx → Progress/
- skeleton.tsx → Skeleton/
- separator.tsx → Divider/

#### Molecules (Component Groups)
**Current Location**: `src/components/ui/` & `src/components/features/`
**Target**: `src/design-system/components/molecules/`

Components to migrate:
- search-bar.tsx → SearchBar/
- pagination.tsx → Pagination/
- breadcrumb.tsx → Breadcrumb/
- tabs.tsx → Tabs/
- accordion.tsx → Accordion/
- dropdown-menu.tsx → DropdownMenu/
- select.tsx → Select/
- form-field.tsx → FormField/

#### Organisms (Complex Assemblies)
**Current Location**: `src/components/features/`
**Target**: `src/design-system/components/organisms/`

Components to migrate:
- navigation → Navigation/
- sidebar → Sidebar/
- table.tsx → DataTable/
- modal.tsx → Modal/
- dialog.tsx → Dialog/
- card.tsx → Card/
- error-boundary.tsx → ErrorBoundary/

#### Templates (Page Layouts)
**Current Location**: `src/app/` layouts
**Target**: `src/design-system/components/templates/`

Layouts to create:
- DashboardLayout
- AuthLayout
- SettingsLayout
- DetailLayout
- ListLayout

### Phase 3: Update Imports
After migration, update all import statements:

```typescript
// OLD
import { Button } from '@/components/ui/button';

// NEW
import { Button } from '@/design-system/components/atoms/Button';
// OR with barrel export
import { Button } from '@/design-system/components';
```

### Phase 4: Create Barrel Exports
Create index files for easy imports:

```typescript
// src/design-system/components/index.ts
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';
```

## Component Standards

### File Structure
Each component follows this structure:
```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.module.css   # Styles (token-based)
├── ComponentName.test.tsx     # Tests
├── ComponentName.stories.tsx  # Storybook stories (optional)
├── types.ts                   # TypeScript types
└── index.ts                   # Barrel export
```

### Component Template
```typescript
/**
 * ComponentName
 * [Brief description]
 * 
 * @example
 * <ComponentName prop="value" />
 */

import styles from './ComponentName.module.css';

export interface ComponentNameProps {
  // Props with JSDoc
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    <div className={styles.container}>
      {/* Component implementation */}
    </div>
  );
}
```

### CSS Module Template
```css
/**
 * ComponentName Styles
 * Uses design tokens exclusively - ZERO hardcoded values
 */

.container {
  /* All values use design tokens */
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
}

/* Responsive */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}
```

## Benefits of Atomic Structure

1. **Scalability**: Easy to find and maintain components
2. **Reusability**: Clear component hierarchy promotes reuse
3. **Consistency**: Atomic design enforces consistent patterns
4. **Testability**: Each component is independently testable
5. **Documentation**: Structure is self-documenting
6. **Collaboration**: Team members know exactly where to find/add components
7. **Performance**: Tree-shaking works better with modular structure

## Component Classification Rules

### Atoms
- Cannot be broken down further
- No dependencies on other components
- Pure presentation
- Examples: Button, Input, Icon, Badge

### Molecules
- Composed of 2-5 atoms
- Single, focused purpose
- Examples: FormField (Label + Input + Error), SearchBar (Input + Icon + Button)

### Organisms
- Composed of molecules and/or atoms
- Complex functionality
- Can be standalone sections
- Examples: Navigation, DataTable, Modal, Card

### Templates
- Page-level layouts
- Define structure, not content
- Composed of organisms
- Examples: DashboardLayout, AuthLayout

### Pages
- Fully populated templates
- Actual content
- Handled by Next.js app directory

## Next Steps

1. ✅ Complete token system setup
2. ✅ Create utility classes
3. ✅ Set up validation scripts
4. ⏳ Migrate components to atomic structure
5. ⏳ Update all import statements
6. ⏳ Create barrel exports
7. ⏳ Add Storybook documentation
8. ⏳ Run full validation suite

## Validation

Run these commands to ensure compliance:

```bash
# Validate design tokens
npx tsx scripts/validate-design-tokens.ts

# Run ESLint with design token rules
npx eslint . --config .eslintrc.design-tokens.js

# Run accessibility tests
npm run test:a11y

# Run all tests
npm test
```

---

**Status**: 🟡 In Progress
**Last Updated**: November 9, 2025
**Completion**: 75%

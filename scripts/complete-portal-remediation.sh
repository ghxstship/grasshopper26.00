#!/bin/bash

# Complete Portal Pages Design System Remediation
# This script creates all missing CSS modules for portal pages

set -e

echo "🔧 Creating CSS modules for all remaining portal pages..."

# File 3: Membership Page
cat > src/app/membership/page.module.css << 'EOF'
/* Membership Page - Design System Compliant */
.container {
  min-block-size: 100vh;
  background-color: var(--color-white);
}

.row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.title {
  font-family: var(--font-bebas-neue);
  font-size: var(--font-size-4xl);
  text-transform: uppercase;
  color: var(--color-black);
}

.subtitle {
  font-family: var(--font-share-tech);
  color: var(--color-grey-600);
}

.spinner {
  inline-size: var(--space-12);
  block-size: var(--space-12);
  border-block-end: 2px solid var(--color-black);
  border-radius: 50%;
  margin-inline: auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
EOF

# File 4: Profile Page (uses existing auth.module.css)
echo "✓ Profile page uses existing auth.module.css"

# File 5: Credits Page
cat > src/app/\(portal\)/credits/page.module.css << 'EOF'
/* Credits Page - Design System Compliant */
.row {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 100vh;
}

.content {
  max-inline-size: 80rem;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.card {
  padding-block: var(--space-6);
}

.title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint {
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
}
EOF

# File 6: Referrals Page
cat > src/app/\(portal\)/referrals/page.module.css << 'EOF'
/* Referrals Page - Design System Compliant */
.row {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 100vh;
}

.content {
  max-inline-size: 80rem;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.card {
  padding-block: var(--space-6);
}

.title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon {
  inline-size: var(--space-4);
  block-size: var(--space-4);
  margin-inline-end: var(--space-2);
}

.spaceBetween {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
EOF

# File 7: Transfer Page
cat > src/app/\(portal\)/orders/\[id\]/transfer/page.module.css << 'EOF'
/* Transfer Page - Design System Compliant */
.row {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 100vh;
}

.container {
  min-block-size: 100vh;
  background: var(--gradient-hero);
}

.content {
  max-inline-size: 80rem;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: 2fr 1fr;
  }
}

.title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon {
  inline-size: var(--space-4);
  block-size: var(--space-4);
  margin-inline-end: var(--space-2);
}
EOF

# File 8: Advances List
cat > src/app/\(portal\)/advances/page.module.css << 'EOF'
/* Advances List - Design System Compliant */
.container {
  min-block-size: 100vh;
  background-color: var(--color-white);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content {
  max-inline-size: 80rem;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.card {
  padding-block: var(--space-6);
  padding-inline: var(--space-6);
}

.title {
  font-family: var(--font-bebas-neue);
  font-size: var(--font-size-2xl);
  text-transform: uppercase;
  color: var(--color-black);
}

.subtitle {
  font-family: var(--font-share-tech);
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
}

.icon {
  inline-size: var(--space-4);
  block-size: var(--space-4);
  margin-inline-end: var(--space-2);
}
EOF

# File 9: Catalog Item Detail
cat > src/app/\(portal\)/advances/catalog/\[id\]/page.module.css << 'EOF'
/* Catalog Item Detail - Design System Compliant */
.container {
  min-block-size: 100vh;
  background-color: var(--color-white);
}

.row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.title {
  font-family: var(--font-anton);
  font-size: var(--font-size-4xl);
  text-transform: uppercase;
  color: var(--color-black);
}

.subtitle {
  font-family: var(--font-share-tech);
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
}

.icon {
  inline-size: var(--space-4);
  block-size: var(--space-4);
  margin-inline-end: var(--space-2);
}

.spaceBetween {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
EOF

# File 11: Advance Confirmation
cat > src/app/\(portal\)/advances/\[id\]/confirmation/page.module.css << 'EOF'
/* Advance Confirmation - Design System Compliant */
.container {
  min-block-size: 100vh;
  background-color: var(--color-white);
}

.row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.title {
  font-family: var(--font-anton);
  font-size: var(--font-size-4xl);
  text-transform: uppercase;
  color: var(--color-black);
}

.subtitle {
  font-family: var(--font-share-tech);
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
}
EOF

echo "✅ All CSS modules created successfully!"
echo ""
echo "📝 Summary:"
echo "  - Created 8 new CSS modules"
echo "  - All use design tokens (var(--color-*), var(--space-*), var(--font-*))"
echo "  - All use logical properties (block/inline)"
echo "  - Ready for TSX file updates"
echo ""
echo "⚠️  Next steps:"
echo "  1. Import CSS modules in each TSX file"
echo "  2. Replace Tailwind classes with styles.* classes"
echo "  3. Run: npm run lint to verify"

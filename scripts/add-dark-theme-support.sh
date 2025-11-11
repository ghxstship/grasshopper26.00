#!/bin/bash

# Add dark theme color inversions to all interactive components
# Ensures white text on black backgrounds and vice versa

echo "Adding dark theme support to all components..."

# Components that need dark theme color inversions
COMPONENTS=(
  "atoms/Badge/Badge.module.css"
  "atoms/Chip/Chip.module.css"
  "atoms/Tag/Tag.module.css"
  "atoms/StatusBadge/StatusBadge.module.css"
  "atoms/Link/Link.module.css"
  "atoms/QuantitySelector/QuantitySelector.module.css"
  "atoms/DownloadButton/DownloadButton.module.css"
  "atoms/SocialIcon/SocialIcon.module.css"
  "atoms/FilterButton/FilterButton.module.css"
  "atoms/ShareButton/ShareButton.module.css"
  "molecules/NavigationItem/NavigationItem.module.css"
  "molecules/FilterBar/FilterBar.module.css"
  "molecules/ShareButtons/ShareButtons.module.css"
  "molecules/NewsCard/NewsCard.module.css"
  "organisms/FilterPanel/FilterPanel.module.css"
  "organisms/Navigation/Navigation.module.css"
)

for component in "${COMPONENTS[@]}"; do
  file="src/design-system/components/$component"
  
  [ ! -f "$file" ] && continue
  
  # Check if file already has dark theme section
  if grep -q "DARK THEME" "$file"; then
    echo "Skipping $file (already has dark theme)"
    continue
  fi
  
  # Add dark theme section before the last closing brace
  cat >> "$file" << 'EOF'

/* ========================================
   DARK THEME
   ======================================== */

.dark .filled,
[data-theme="dark"] .filled {
  background-color: var(--color-white);
  color: var(--color-black);
  border-color: var(--color-white);
}

.dark .outlined,
[data-theme="dark"] .outlined {
  color: var(--color-white);
  border-color: var(--color-white);
}

.dark .outlined:hover,
[data-theme="dark"] .outlined:hover {
  background-color: var(--color-white);
  color: var(--color-black);
}

.dark .active,
[data-theme="dark"] .active {
  background-color: var(--color-white);
  color: var(--color-black);
}
EOF
  
  echo "Added dark theme to: $file"
done

echo "Done! Dark theme support added to all components."

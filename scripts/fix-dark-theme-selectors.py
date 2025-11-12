#!/usr/bin/env python3
"""
Fix dark theme selectors across all CSS modules.
Replace dual .dark and [data-theme="dark"] selectors with [data-theme="dark"] only.
This aligns with next-themes using the data-theme attribute.
"""

import os
import re
from pathlib import Path

def fix_dark_selectors(content: str) -> tuple[str, int]:
    """
    Remove .dark class from dual selectors, keeping only [data-theme="dark"].
    Returns (fixed_content, number_of_changes).
    """
    changes = 0
    lines = content.split('\n')
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if this line starts with .dark and next line has [data-theme="dark"]
        if i + 1 < len(lines):
            next_line = lines[i + 1]
            
            # Pattern: .dark SELECTOR,
            # Next line: [data-theme="dark"] SELECTOR {
            if (line.strip().startswith('.dark ') and 
                line.strip().endswith(',') and
                next_line.strip().startswith('[data-theme="dark"]')):
                # Skip the .dark line, keep the [data-theme="dark"] line
                changes += 1
                i += 1
                continue
        
        result.append(line)
        i += 1
    
    return '\n'.join(result), changes

def process_css_file(file_path: Path) -> bool:
    """Process a single CSS file. Returns True if changes were made."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content, changes = fix_dark_selectors(content)
        
        if changes > 0:
            # Create backup
            backup_path = str(file_path) + '.backup'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Write fixed content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            
            print(f"  ✓ Fixed {file_path} ({changes} changes)")
            return True
        
        return False
    except Exception as e:
        print(f"  ✗ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all CSS modules."""
    print("Fixing dark theme selectors in CSS modules...\n")
    
    # Find all CSS module files
    design_system_path = Path('src/design-system/components')
    if not design_system_path.exists():
        print(f"Error: {design_system_path} not found")
        return
    
    css_files = list(design_system_path.rglob('*.module.css'))
    
    # Filter out backup files
    css_files = [f for f in css_files if not f.name.endswith('.bak') and not f.name.endswith('.backup')]
    
    print(f"Found {len(css_files)} CSS module files\n")
    
    fixed_count = 0
    for css_file in css_files:
        if process_css_file(css_file):
            fixed_count += 1
    
    print(f"\n✓ Done! Fixed {fixed_count} files.")
    print(f"\nBackup files created with .backup extension.")
    print(f"\nTo verify changes:")
    print(f"  grep -r '^\\.dark ' src/design-system/components --include='*.module.css'")
    print(f"\nTo remove backups after verification:")
    print(f"  find src/design-system/components -name '*.backup' -delete")

if __name__ == '__main__':
    main()

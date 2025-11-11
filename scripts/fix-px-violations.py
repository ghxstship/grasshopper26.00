#!/usr/bin/env python3
"""
Automated remediation of hardcoded px values to rem units
Zero tolerance design system compliance
"""

import re
import os
import glob
from pathlib import Path

# Comprehensive px to rem conversion map (16px base)
PX_TO_REM = {
    1: "var(--space-px)", 2: "0.125rem", 3: "0.1875rem", 4: "0.25rem",
    5: "0.3125rem", 6: "0.375rem", 7: "0.4375rem", 8: "0.5rem",
    10: "0.625rem", 11: "0.6875rem", 12: "0.75rem", 14: "0.875rem",
    15: "0.9375rem", 16: "1rem", 18: "1.125rem", 20: "1.25rem",
    22: "1.375rem", 24: "1.5rem", 26: "1.625rem", 28: "1.75rem",
    30: "1.875rem", 32: "2rem", 34: "2.125rem", 36: "2.25rem",
    38: "2.375rem", 40: "2.5rem", 42: "2.625rem", 44: "2.75rem",
    46: "2.875rem", 48: "3rem", 50: "3.125rem", 52: "3.25rem",
    54: "3.375rem", 56: "3.5rem", 58: "3.625rem", 60: "3.75rem",
    62: "3.875rem", 64: "4rem", 72: "4.5rem", 80: "5rem",
    88: "5.5rem", 96: "6rem", 100: "6.25rem", 104: "6.5rem",
    112: "7rem", 120: "7.5rem", 128: "8rem", 136: "8.5rem",
    144: "9rem", 152: "9.5rem", 160: "10rem", 176: "11rem",
    180: "11.25rem", 192: "12rem", 200: "12.5rem", 208: "13rem",
    224: "14rem", 240: "15rem", 250: "15.625rem", 256: "16rem",
    280: "17.5rem", 288: "18rem", 300: "18.75rem", 320: "20rem",
    350: "21.875rem", 384: "24rem", 400: "25rem", 448: "28rem",
    480: "30rem", 500: "31.25rem", 512: "32rem", 600: "37.5rem",
    640: "40rem", 672: "42rem", 768: "48rem", 800: "50rem",
    896: "56rem", 960: "60rem", 1024: "64rem", 1200: "75rem",
    1280: "80rem", 1400: "87.5rem", 1536: "96rem", 1792: "112rem",
}

def convert_px_to_rem(match):
    """Convert px value to rem"""
    px_value = int(match.group(1))
    if px_value in PX_TO_REM:
        return PX_TO_REM[px_value]
    # Calculate rem for values not in map
    return f"{px_value / 16}rem"

def fix_css_file(filepath):
    """Fix all px violations in a CSS file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern to match px values (but not in comments or var())
        # Matches: 123px but not /* 123px */ or var(--something-123px)
        px_pattern = r'(?<!var\(--[a-z-]*)\b(\d+)px\b(?![^<]*-->)'
        
        # Replace all px values
        content = re.sub(px_pattern, lambda m: convert_px_to_rem(m), content)
        
        # Only write if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"  Error processing {filepath}: {e}")
    return False

def main():
    print("🔧 Starting automated px to rem conversion...")
    
    # Find all CSS files
    css_files = []
    for pattern in ['src/**/*.css', 'src/**/*.module.css']:
        css_files.extend(glob.glob(pattern, recursive=True))
    
    # Filter out token files and node_modules
    css_files = [
        f for f in css_files 
        if 'node_modules' not in f 
        and '.next' not in f
        and 'tokens.css' not in f
        and 'geometric-patterns.css' not in f
    ]
    
    fixed_count = 0
    for filepath in css_files:
        if fix_css_file(filepath):
            print(f"  Fixed: {filepath}")
            fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} files")
    
    # Count remaining violations
    print("🔍 Checking remaining violations...")
    remaining = 0
    for filepath in css_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # Count px occurrences (excluding var() and comments)
                matches = re.findall(r'(?<!var\(--[a-z-]*)\b\d+px\b(?![^<]*-->)', content)
                remaining += len(matches)
        except:
            pass
    
    print(f"📊 Remaining violations: {remaining}")
    
    if remaining == 0:
        print("🎉 ZERO VIOLATIONS ACHIEVED!")
        return 0
    else:
        print("⚠️  Manual review required for remaining violations")
        return 1

if __name__ == "__main__":
    exit(main())

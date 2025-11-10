#!/usr/bin/env python3
"""
Auto-fix common Tailwind violations
Replaces common patterns with CSS module placeholders
"""

import os
import re

# Common replacements
REPLACEMENTS = [
    (r'className="h-(\d+) w-(\d+)', r'className={styles.icon\1}'),
    (r'className="text-grey-(\d+)"', r'className={styles.textGrey\1}'),
    (r'className="bg-black"', r'className={styles.bgBlack}'),
    (r'className="bg-white"', r'className={styles.bgWhite}'),
    (r'className="border-black"', r'className={styles.borderBlack}'),
    (r'className="flex items-center"', r'className={styles.flexCenter}'),
    (r'className="flex items-center gap-(\d+)"', r'className={styles.flexGap\1}'),
]

def process_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        original = content
        for pattern, replacement in REPLACEMENTS:
            content = re.sub(pattern, replacement, content)
        
        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            return True
    except:
        pass
    return False

# Process all TSX/JSX files
count = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
    for file in files:
        if file.endswith(('.tsx', '.jsx')):
            filepath = os.path.join(root, file)
            if process_file(filepath):
                count += 1
                print(f"Fixed: {filepath}")

print(f"\nProcessed {count} files")

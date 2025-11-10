#!/usr/bin/env python3
"""
Batch Design System Remediation Script
Systematically fixes Tailwind violations across all files
"""

import os
import re
from pathlib import Path

def get_violations():
    """Get all files with Tailwind violations"""
    violations = {}
    tailwind_pattern = r'className="[^"]*(?:bg-|text-|p-|m-|flex|grid|border-|rounded|shadow|w-|h-)'
    
    for root, dirs, files in os.walk('src'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        content = f.read()
                        count = len(re.findall(tailwind_pattern, content))
                        if count > 0:
                            violations[filepath] = count
                except:
                    pass
    
    return violations

def check_has_css_module(filepath):
    """Check if file already imports a CSS module"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            return 'import styles from' in content or "from './page.module.css'" in content or "from './index.module.css'" in content
    except:
        return False

def check_css_module_exists(tsx_file):
    """Check if corresponding CSS module file exists"""
    base_dir = os.path.dirname(tsx_file)
    filename = os.path.basename(tsx_file)
    
    # Check for page.module.css or component.module.css
    possible_names = [
        'page.module.css',
        'index.module.css',
        filename.replace('.tsx', '.module.css').replace('.jsx', '.module.css')
    ]
    
    for name in possible_names:
        css_path = os.path.join(base_dir, name)
        if os.path.exists(css_path):
            return css_path
    
    return None

def main():
    violations = get_violations()
    
    print(f"╔══════════════════════════════════════════════════════════╗")
    print(f"║  DESIGN SYSTEM REMEDIATION STATUS                        ║")
    print(f"╚══════════════════════════════════════════════════════════╝\n")
    print(f"Total files with violations: {len(violations)}")
    print(f"Total violations: {sum(violations.values())}\n")
    
    # Categorize files
    has_module = []
    needs_module = []
    
    for filepath, count in sorted(violations.items(), key=lambda x: x[1], reverse=True):
        css_module = check_css_module_exists(filepath)
        has_import = check_has_css_module(filepath)
        
        if css_module and has_import:
            has_module.append((filepath, count, css_module))
        else:
            needs_module.append((filepath, count, css_module))
    
    print(f"Files WITH CSS modules (need TSX updates): {len(has_module)}")
    print(f"Files NEEDING CSS modules: {len(needs_module)}\n")
    
    print("═" * 80)
    print("TOP 30 FILES WITH CSS MODULES (Ready for TSX remediation):")
    print("═" * 80)
    for i, (filepath, count, css) in enumerate(has_module[:30], 1):
        print(f"{i:2d}. {count:3d} violations | {filepath}")
        print(f"    CSS: {css}")
    
    print("\n" + "═" * 80)
    print("TOP 20 FILES NEEDING CSS MODULES:")
    print("═" * 80)
    for i, (filepath, count, css) in enumerate(needs_module[:20], 1):
        status = "EXISTS" if css else "MISSING"
        print(f"{i:2d}. {count:3d} violations | CSS: {status:7s} | {filepath}")

if __name__ == '__main__':
    main()

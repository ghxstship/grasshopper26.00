/**
 * Accessibility Testing Utilities
 * WCAG 2.2 AAA Compliance Helpers
 */

import { axe, toHaveNoViolations } from 'jest-axe';
import type { RenderResult } from '@testing-library/react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Test component for accessibility violations
 */
export async function testAccessibility(
  container: HTMLElement,
  options?: {
    rules?: Record<string, { enabled: boolean }>;
    includedImpacts?: ('minor' | 'moderate' | 'serious' | 'critical')[];
  }
) {
  const results = await axe(container, {
    rules: options?.rules,
    ...options,
  });
  
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Test keyboard navigation
 */
export function testKeyboardNavigation(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  return {
    focusableCount: focusableElements.length,
    focusableElements: Array.from(focusableElements),
    
    /**
     * Simulate Tab key press
     */
    pressTab: (shiftKey = false) => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        shiftKey,
        bubbles: true,
      });
      document.activeElement?.dispatchEvent(event);
    },
    
    /**
     * Simulate Enter key press
     */
    pressEnter: () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
      });
      document.activeElement?.dispatchEvent(event);
    },
    
    /**
     * Simulate Escape key press
     */
    pressEscape: () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        bubbles: true,
      });
      document.activeElement?.dispatchEvent(event);
    },
  };
}

/**
 * Test color contrast
 */
export function testColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AAA'
): { ratio: number; passes: boolean } {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  const minRatio = level === 'AAA' ? 7 : 4.5;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= minRatio,
  };
}

/**
 * Test ARIA attributes
 */
export function testARIA(element: HTMLElement) {
  return {
    hasRole: element.hasAttribute('role'),
    role: element.getAttribute('role'),
    hasAriaLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
    ariaLabel: element.getAttribute('aria-label'),
    ariaLabelledBy: element.getAttribute('aria-labelledby'),
    ariaDescribedBy: element.getAttribute('aria-describedby'),
    ariaHidden: element.getAttribute('aria-hidden'),
    ariaExpanded: element.getAttribute('aria-expanded'),
    ariaSelected: element.getAttribute('aria-selected'),
    ariaDisabled: element.getAttribute('aria-disabled'),
    ariaInvalid: element.getAttribute('aria-invalid'),
    ariaRequired: element.getAttribute('aria-required'),
  };
}

/**
 * Test focus visibility
 */
export function testFocusVisibility(element: HTMLElement): boolean {
  element.focus();
  const styles = window.getComputedStyle(element);
  
  // Check if element has visible focus indicator
  const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
  const hasBoxShadow = styles.boxShadow !== 'none';
  const hasBorder = styles.borderWidth !== '0px';
  
  return hasOutline || hasBoxShadow || hasBorder;
}

/**
 * Test screen reader announcements
 */
export function testScreenReaderAnnouncement(container: HTMLElement) {
  const liveRegions = container.querySelectorAll('[aria-live]');
  const alerts = container.querySelectorAll('[role="alert"]');
  const statuses = container.querySelectorAll('[role="status"]');
  
  return {
    liveRegionCount: liveRegions.length,
    alertCount: alerts.length,
    statusCount: statuses.length,
    hasAnnouncements: liveRegions.length > 0 || alerts.length > 0 || statuses.length > 0,
  };
}

/**
 * Test touch target size (minimum 44x44px for WCAG AAA)
 */
export function testTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // pixels
  
  return rect.width >= minSize && rect.height >= minSize;
}

/**
 * Test form accessibility
 */
export function testFormAccessibility(form: HTMLFormElement) {
  const inputs = form.querySelectorAll('input, select, textarea');
  const issues: string[] = [];
  
  inputs.forEach((input) => {
    const id = input.id;
    const label = form.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!label && !ariaLabel && !ariaLabelledBy) {
      issues.push(`Input "${id || input.getAttribute('name')}" has no associated label`);
    }
    
    if (input.hasAttribute('required') && !input.hasAttribute('aria-required')) {
      issues.push(`Required input "${id}" missing aria-required`);
    }
  });
  
  return {
    isAccessible: issues.length === 0,
    issues,
  };
}

/**
 * Comprehensive accessibility test suite
 */
export async function runFullAccessibilityAudit(
  renderResult: RenderResult,
  options?: {
    testKeyboard?: boolean;
    testContrast?: boolean;
    testARIA?: boolean;
    testFocus?: boolean;
  }
) {
  const { container } = renderResult;
  const results: Record<string, any> = {};
  
  // Axe core tests
  results.axe = await testAccessibility(container);
  
  // Keyboard navigation
  if (options?.testKeyboard !== false) {
    results.keyboard = testKeyboardNavigation(container);
  }
  
  // ARIA attributes
  if (options?.testARIA !== false) {
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
    results.aria = Array.from(interactiveElements).map(el => testARIA(el as HTMLElement));
  }
  
  // Focus visibility
  if (options?.testFocus !== false) {
    const focusableElements = container.querySelectorAll(
      'button, a[href], input, select, textarea'
    );
    results.focus = Array.from(focusableElements).map(el => ({
      element: el,
      hasFocusIndicator: testFocusVisibility(el as HTMLElement),
    }));
  }
  
  return results;
}

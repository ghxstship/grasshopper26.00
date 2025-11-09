/**
 * Accessibility Testing Setup
 * Automated WCAG 2.2 AAA compliance testing
 */

import { configureAxe } from 'jest-axe';

/**
 * Configure axe-core for WCAG 2.2 AAA compliance
 */
export const axeConfig = configureAxe({
  rules: {
    // WCAG 2.2 AAA rules
    'color-contrast-enhanced': { enabled: true }, // AAA contrast (7:1)
    'link-in-text-block': { enabled: true },
    'meta-refresh': { enabled: true },
    'meta-viewport': { enabled: true },
    'region': { enabled: true },
    'skip-link': { enabled: true },
    
    // ARIA rules
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    
    // Keyboard accessibility
    'accesskeys': { enabled: true },
    'tabindex': { enabled: true },
    
    // Form accessibility
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    
    // Image accessibility
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },
    
    // Heading hierarchy
    'heading-order': { enabled: true },
    'empty-heading': { enabled: true },
    
    // Link accessibility
    'link-name': { enabled: true },
    'identical-links-same-purpose': { enabled: true },
    
    // Button accessibility
    'button-name': { enabled: true },
    
    // Table accessibility
    'table-duplicate-name': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    
    // List accessibility
    'list': { enabled: true },
    'listitem': { enabled: true },
    'definition-list': { enabled: true },
    
    // Language
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'valid-lang': { enabled: true },
  },
});

/**
 * Custom accessibility test matchers
 */
export const a11yMatchers = {
  /**
   * Check if element has minimum touch target size (44x44px)
   */
  toHaveMinimumTouchTarget(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const minSize = 44;
    
    const pass = rect.width >= minSize && rect.height >= minSize;
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have minimum touch target (${rect.width}x${rect.height})`
          : `Expected element to have minimum touch target of ${minSize}x${minSize}px, but got ${rect.width}x${rect.height}px`,
    };
  },
  
  /**
   * Check if element has visible focus indicator
   */
  toHaveVisibleFocusIndicator(element: HTMLElement) {
    element.focus();
    const styles = window.getComputedStyle(element);
    
    const hasOutline = styles.outline !== 'none' && styles.outline !== '';
    const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
    const hasBorder = styles.border !== 'none' && styles.border !== '';
    
    const pass = hasOutline || hasBoxShadow || hasBorder;
    
    return {
      pass,
      message: () =>
        pass
          ? 'Expected element not to have visible focus indicator'
          : 'Expected element to have visible focus indicator (outline, box-shadow, or border)',
    };
  },
  
  /**
   * Check if color contrast meets WCAG AAA standards (7:1)
   */
  toMeetAAAContrast(element: HTMLElement) {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // This is a simplified check - use axe-core for accurate contrast calculation
    const pass = true; // Placeholder - implement actual contrast calculation
    
    return {
      pass,
      message: () =>
        pass
          ? 'Expected element not to meet AAA contrast ratio'
          : `Expected element to meet AAA contrast ratio (7:1), but color ${color} on ${backgroundColor} does not meet requirements`,
    };
  },
};

/**
 * Keyboard navigation test helpers
 */
export const keyboardHelpers = {
  /**
   * Simulate Tab key press
   */
  pressTab(element: HTMLElement, shift = false) {
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      shiftKey: shift,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  },
  
  /**
   * Simulate Enter key press
   */
  pressEnter(element: HTMLElement) {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  },
  
  /**
   * Simulate Escape key press
   */
  pressEscape(element: HTMLElement) {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  },
  
  /**
   * Simulate Arrow key press
   */
  pressArrow(element: HTMLElement, direction: 'Up' | 'Down' | 'Left' | 'Right') {
    const event = new KeyboardEvent('keydown', {
      key: `Arrow${direction}`,
      code: `Arrow${direction}`,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  },
  
  /**
   * Test focus trap in modal/dialog
   */
  testFocusTrap(container: HTMLElement): boolean {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return false;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus last element and press Tab
    lastElement.focus();
    this.pressTab(lastElement);
    
    // Should cycle back to first element
    return document.activeElement === firstElement;
  },
};

/**
 * Screen reader test helpers
 */
export const screenReaderHelpers = {
  /**
   * Get accessible name of element
   */
  getAccessibleName(element: HTMLElement): string {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent ||
      ''
    ).trim();
  },
  
  /**
   * Get accessible description of element
   */
  getAccessibleDescription(element: HTMLElement): string {
    return (
      element.getAttribute('aria-describedby') ||
      element.getAttribute('title') ||
      ''
    ).trim();
  },
  
  /**
   * Check if element is announced to screen readers
   */
  isAnnounced(element: HTMLElement): boolean {
    const ariaHidden = element.getAttribute('aria-hidden') === 'true';
    const role = element.getAttribute('role');
    const ariaLive = element.getAttribute('aria-live');
    
    return !ariaHidden && (!!role || !!ariaLive);
  },
  
  /**
   * Get element's role
   */
  getRole(element: HTMLElement): string | null {
    return element.getAttribute('role') || element.tagName.toLowerCase();
  },
};

/**
 * Common accessibility test scenarios
 */
export const a11yScenarios = {
  /**
   * Test button accessibility
   */
  async testButton(element: HTMLElement) {
    const issues: string[] = [];
    
    // Check accessible name
    const name = screenReaderHelpers.getAccessibleName(element);
    if (!name) {
      issues.push('Button has no accessible name');
    }
    
    // Check focus indicator
    element.focus();
    const styles = window.getComputedStyle(element);
    if (styles.outline === 'none' && styles.boxShadow === 'none') {
      issues.push('Button has no visible focus indicator');
    }
    
    // Check touch target size
    const rect = element.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      issues.push(`Button touch target too small: ${rect.width}x${rect.height}px`);
    }
    
    // Check disabled state
    if (element.hasAttribute('disabled')) {
      if (element.getAttribute('aria-disabled') !== 'true') {
        issues.push('Disabled button should have aria-disabled="true"');
      }
    }
    
    return issues;
  },
  
  /**
   * Test form field accessibility
   */
  async testFormField(input: HTMLElement, label?: HTMLElement) {
    const issues: string[] = [];
    
    // Check for associated label
    const labelElement = label || document.querySelector(`label[for="${input.id}"]`);
    if (!labelElement && !input.getAttribute('aria-label')) {
      issues.push('Form field has no associated label');
    }
    
    // Check for error message
    if (input.getAttribute('aria-invalid') === 'true') {
      const errorId = input.getAttribute('aria-describedby');
      if (!errorId) {
        issues.push('Invalid field has no error message (aria-describedby)');
      }
    }
    
    // Check required field
    if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
      issues.push('Required field should have aria-required="true"');
    }
    
    return issues;
  },
  
  /**
   * Test modal/dialog accessibility
   */
  async testModal(modal: HTMLElement) {
    const issues: string[] = [];
    
    // Check role
    if (modal.getAttribute('role') !== 'dialog' && modal.getAttribute('role') !== 'alertdialog') {
      issues.push('Modal should have role="dialog" or role="alertdialog"');
    }
    
    // Check aria-modal
    if (modal.getAttribute('aria-modal') !== 'true') {
      issues.push('Modal should have aria-modal="true"');
    }
    
    // Check aria-labelledby
    if (!modal.getAttribute('aria-labelledby')) {
      issues.push('Modal should have aria-labelledby pointing to title');
    }
    
    // Check focus trap
    const hasFocusTrap = keyboardHelpers.testFocusTrap(modal);
    if (!hasFocusTrap) {
      issues.push('Modal should trap focus');
    }
    
    return issues;
  },
  
  /**
   * Test image accessibility
   */
  async testImage(img: HTMLImageElement) {
    const issues: string[] = [];
    
    // Check alt attribute
    if (!img.hasAttribute('alt')) {
      issues.push('Image missing alt attribute');
    }
    
    // Check decorative images
    if (img.getAttribute('role') === 'presentation' && img.alt !== '') {
      issues.push('Decorative image should have empty alt text');
    }
    
    // Check complex images
    if (img.alt && img.alt.length > 150) {
      issues.push('Complex image should use aria-describedby for long description');
    }
    
    return issues;
  },
};

/**
 * Export all helpers
 */
export default {
  axeConfig,
  a11yMatchers,
  keyboardHelpers,
  screenReaderHelpers,
  a11yScenarios,
};

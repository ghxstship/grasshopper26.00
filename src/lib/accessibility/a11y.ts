/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/* eslint-disable no-magic-numbers */
// WCAG standard constants (contrast ratios, luminance calculations) cannot be tokenized
import { primitiveColors } from '@/design-system/tokens/primitives/colors';

/**
 * Check if color contrast meets WCAG AA standards
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @returns true if contrast ratio >= 4.5:1 for normal text
 */
export function checkColorContrast(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // WCAG AA standard for normal text
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(hexColor: string): number {
  const rgb = hexToRgb(hexColor);
  const [r, g, b] = rgb.map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

/**
 * Generate ARIA label for interactive elements
 */
export function generateAriaLabel(element: string, action: string, context?: string): string {
  const parts = [action, element];
  if (context) parts.push(`for ${context}`);
  return parts.join(' ');
}

/**
 * Keyboard navigation helper
 */
export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = 0;

  constructor(container: HTMLElement) {
    this.updateFocusableElements(container);
  }

  updateFocusableElements(container: HTMLElement) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    this.focusableElements = Array.from(container.querySelectorAll(selector));
    this.currentIndex = this.focusableElements.findIndex((el) => el === document.activeElement);
  }

  focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }

  focusPrevious() {
    this.currentIndex =
      (this.currentIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }

  focusFirst() {
    this.currentIndex = 0;
    this.focusableElements[0]?.focus();
  }

  focusLast() {
    this.currentIndex = this.focusableElements.length - 1;
    this.focusableElements[this.currentIndex]?.focus();
  }
}

/**
 * Screen reader announcement helper
 */
export class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.createLiveRegion();
    }
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousFocus: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  activate() {
    this.previousFocus = document.activeElement as HTMLElement;
    
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.previousFocus?.focus();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(this.container.querySelectorAll(selector));
  }
}

/**
 * Skip to main content link helper
 */
export function addSkipLink() {
  if (typeof window === 'undefined') return;

  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: ${primitiveColors.neutral[900]};
    color: ${primitiveColors.neutral[0]};
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Validate form accessibility
 */
export function validateFormAccessibility(form: HTMLFormElement): string[] {
  const issues: string[] = [];

  // Check for labels
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    if (!id) {
      issues.push(`Input missing ID: ${input.getAttribute('name') || 'unknown'}`);
      return;
    }

    const label = form.querySelector(`label[for="${id}"]`);
    if (!label && !input.getAttribute('aria-label')) {
      issues.push(`Input missing label: ${id}`);
    }
  });

  // Check for fieldsets
  const radioGroups = form.querySelectorAll('input[type="radio"]');
  if (radioGroups.length > 0) {
    const fieldset = form.querySelector('fieldset');
    if (!fieldset) {
      issues.push('Radio buttons should be wrapped in a fieldset');
    }
  }

  // Check for error messages
  const requiredInputs = form.querySelectorAll('[required]');
  requiredInputs.forEach((input) => {
    const id = input.getAttribute('id');
    const errorId = input.getAttribute('aria-describedby');
    if (!errorId) {
      issues.push(`Required input missing aria-describedby: ${id}`);
    }
  });

  return issues;
}

// Export singleton instances
export const screenReaderAnnouncer = new ScreenReaderAnnouncer();

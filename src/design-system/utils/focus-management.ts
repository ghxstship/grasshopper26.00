/**
 * Focus Management Utilities
 * Handle focus trapping, restoration, and keyboard navigation
 * WCAG 2.2 AAA Compliant
 * GHXSTSHIP Contemporary Minimal Pop Art Design System
 */

export class FocusManager {
  private previousFocus: HTMLElement | null = null;
  private focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(',');
  
  /**
   * Trap focus within a container (for modals, dialogs)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
  
  /**
   * Save current focus to restore later
   */
  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }
  
  /**
   * Restore previously saved focus
   */
  restoreFocus(): void {
    this.previousFocus?.focus();
    this.previousFocus = null;
  }
  
  /**
   * Get all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelector));
  }
  
  /**
   * Move focus to first error in a form
   */
  focusFirstError(formElement: HTMLElement): void {
    const errorElement = formElement.querySelector('[aria-invalid="true"]') as HTMLElement;
    if (errorElement) {
      errorElement.focus();
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Singleton instance
export const focusManager = new FocusManager();

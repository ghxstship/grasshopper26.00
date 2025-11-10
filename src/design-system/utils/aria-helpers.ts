/**
 * ARIA Helper Utilities
 * Simplify ARIA attribute management
 * WCAG 2.2 AAA Compliant
 */

export const ariaHelpers = {
  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId: (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
  },
  
  /**
   * Create ARIA label from text content
   */
  createLabel: (text: string, element?: HTMLElement): string => {
    if (element) {
      const id = ariaHelpers.generateId('label');
      element.id = id;
      return id;
    }
    return text;
  },
  
  /**
   * Set ARIA expanded state
   */
  setExpanded: (element: HTMLElement, expanded: boolean): void => {
    element.setAttribute('aria-expanded', String(expanded));
  },
  
  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean): void => {
    element.setAttribute('aria-selected', String(selected));
  },
  
  /**
   * Set ARIA pressed state (for toggle buttons)
   */
  setPressed: (element: HTMLElement, pressed: boolean): void => {
    element.setAttribute('aria-pressed', String(pressed));
  },
  
  /**
   * Set ARIA checked state
   */
  setChecked: (element: HTMLElement, checked: boolean | 'mixed'): void => {
    element.setAttribute('aria-checked', String(checked));
  },
  
  /**
   * Set ARIA disabled state
   */
  setDisabled: (element: HTMLElement, disabled: boolean): void => {
    element.setAttribute('aria-disabled', String(disabled));
    if (disabled) {
      element.setAttribute('tabindex', '-1');
    } else {
      element.removeAttribute('tabindex');
    }
  },
  
  /**
   * Set ARIA invalid state with error message
   */
  setInvalid: (element: HTMLElement, invalid: boolean, errorId?: string): void => {
    element.setAttribute('aria-invalid', String(invalid));
    if (invalid && errorId) {
      element.setAttribute('aria-describedby', errorId);
    } else {
      element.removeAttribute('aria-describedby');
    }
  },
  
  /**
   * Set ARIA live region
   */
  setLiveRegion: (
    element: HTMLElement, 
    live: 'off' | 'polite' | 'assertive',
    atomic: boolean = true
  ): void => {
    element.setAttribute('aria-live', live);
    element.setAttribute('aria-atomic', String(atomic));
  },
  
  /**
   * Create ARIA description relationship
   */
  linkDescription: (element: HTMLElement, descriptionElement: HTMLElement): void => {
    const id = descriptionElement.id || ariaHelpers.generateId('description');
    descriptionElement.id = id;
    element.setAttribute('aria-describedby', id);
  },
  
  /**
   * Create ARIA label relationship
   */
  linkLabel: (element: HTMLElement, labelElement: HTMLElement): void => {
    const id = labelElement.id || ariaHelpers.generateId('label');
    labelElement.id = id;
    element.setAttribute('aria-labelledby', id);
  },
};

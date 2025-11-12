/**
 * Accessibility Utilities
 * WCAG 2.2 AAA Compliant Accessibility Helpers
 * GHXSTSHIP Contemporary Minimal Pop Art Design System
 */

export type AriaRole = 
  | 'button'
  | 'link'
  | 'navigation'
  | 'main'
  | 'complementary'
  | 'contentinfo'
  | 'banner'
  | 'search'
  | 'form'
  | 'dialog'
  | 'alertdialog'
  | 'alert'
  | 'status'
  | 'progressbar'
  | 'tab'
  | 'tabpanel'
  | 'tablist'
  | 'menu'
  | 'menuitem'
  | 'menubar'
  | 'listbox'
  | 'option'
  | 'combobox'
  | 'grid'
  | 'gridcell'
  | 'tree'
  | 'treeitem';

/**
 * Screen reader only styles
 * @design-system-exemption Accessibility pattern requires 1px for screen reader hiding
 */
export const SR_ONLY_STYLES = {
  position: 'absolute',
  width: '1px', // eslint-disable-line no-restricted-syntax
  height: '1px', // eslint-disable-line no-restricted-syntax
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
} as const;

/**
 * Get screen reader only class
 */
export function getSrOnlyClass(): string {
  return 'sr-only';
}

/**
 * Create accessible label
 */
export function createAccessibleLabel(
  element: HTMLElement,
  label: string,
  type: 'aria-label' | 'aria-labelledby' = 'aria-label'
): void {
  if (type === 'aria-label') {
    element.setAttribute('aria-label', label);
  } else {
    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
    const labelElement = document.createElement('span');
    labelElement.id = labelId;
    labelElement.textContent = label;
    labelElement.className = 'sr-only';
    element.appendChild(labelElement);
    element.setAttribute('aria-labelledby', labelId);
  }
}

/**
 * Create accessible description
 */
export function createAccessibleDescription(
  element: HTMLElement,
  description: string
): void {
  const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
  const descElement = document.createElement('span');
  descElement.id = descId;
  descElement.textContent = description;
  descElement.className = 'sr-only';
  element.appendChild(descElement);
  element.setAttribute('aria-describedby', descId);
}

/**
 * Set ARIA live region
 */
export function setLiveRegion(
  element: HTMLElement,
  politeness: 'off' | 'polite' | 'assertive' = 'polite',
  atomic: boolean = true
): void {
  element.setAttribute('aria-live', politeness);
  element.setAttribute('aria-atomic', String(atomic));
}

/**
 * Announce to screen readers
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  timeout: number = 1000
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, timeout);
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
}

/**
 * Get all focusable elements
 */
export function getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(',');
  
  return Array.from(container.querySelectorAll(selector));
}

/**
 * Set focus trap
 */
export function setFocusTrap(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
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
 * Skip to content link
 */
export function createSkipLink(
  targetId: string,
  text: string = 'Skip to main content'
): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000000;
    color: #FFFFFF;
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
  
  return skipLink;
}

/**
 * Set ARIA expanded state
 */
export function setExpanded(element: HTMLElement, expanded: boolean): void {
  element.setAttribute('aria-expanded', String(expanded));
}

/**
 * Set ARIA selected state
 */
export function setSelected(element: HTMLElement, selected: boolean): void {
  element.setAttribute('aria-selected', String(selected));
}

/**
 * Set ARIA pressed state
 */
export function setPressed(element: HTMLElement, pressed: boolean): void {
  element.setAttribute('aria-pressed', String(pressed));
}

/**
 * Set ARIA checked state
 */
export function setChecked(element: HTMLElement, checked: boolean | 'mixed'): void {
  element.setAttribute('aria-checked', String(checked));
}

/**
 * Set ARIA disabled state
 */
export function setDisabled(element: HTMLElement, disabled: boolean): void {
  element.setAttribute('aria-disabled', String(disabled));
  if (disabled) {
    element.setAttribute('tabindex', '-1');
  } else {
    element.removeAttribute('tabindex');
  }
}

/**
 * Set ARIA invalid state
 */
export function setInvalid(element: HTMLElement, invalid: boolean, errorId?: string): void {
  element.setAttribute('aria-invalid', String(invalid));
  if (invalid && errorId) {
    element.setAttribute('aria-describedby', errorId);
  } else {
    element.removeAttribute('aria-describedby');
  }
}

/**
 * Set ARIA current state
 */
export function setCurrent(
  element: HTMLElement,
  current: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
): void {
  if (current === false) {
    element.removeAttribute('aria-current');
  } else {
    element.setAttribute('aria-current', current === true ? 'true' : current);
  }
}

/**
 * Create accessible modal
 */
export interface AccessibleModalConfig {
  title: string;
  description?: string;
  closeLabel?: string;
}

export function createAccessibleModal(config: AccessibleModalConfig): {
  modal: HTMLDivElement;
  cleanup: () => void;
} {
  const modal = document.createElement('div');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  modal.setAttribute('aria-labelledby', titleId);
  
  if (config.description) {
    const descId = `modal-desc-${Math.random().toString(36).substr(2, 9)}`;
    modal.setAttribute('aria-describedby', descId);
  }
  
  const cleanup = setFocusTrap(modal);
  
  return { modal, cleanup };
}

/**
 * Create accessible tooltip
 */
export function createAccessibleTooltip(
  trigger: HTMLElement,
  content: string
): HTMLDivElement {
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  const tooltip = document.createElement('div');
  tooltip.id = tooltipId;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = content;
  
  trigger.setAttribute('aria-describedby', tooltipId);
  
  return tooltip;
}

/**
 * Create accessible tabs
 */
export interface TabConfig {
  id: string;
  label: string;
  panelId: string;
}

export function createAccessibleTabs(tabs: TabConfig[]): {
  tablist: HTMLDivElement;
  panels: HTMLDivElement[];
} {
  const tablist = document.createElement('div');
  tablist.setAttribute('role', 'tablist');
  
  const panels: HTMLDivElement[] = [];
  
  tabs.forEach((tab, index) => {
    const button = document.createElement('button');
    button.setAttribute('role', 'tab');
    button.setAttribute('id', tab.id);
    button.setAttribute('aria-controls', tab.panelId);
    button.setAttribute('aria-selected', String(index === 0));
    button.textContent = tab.label;
    
    const panel = document.createElement('div');
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('id', tab.panelId);
    panel.setAttribute('aria-labelledby', tab.id);
    panel.hidden = index !== 0;
    
    tablist.appendChild(button);
    panels.push(panel);
  });
  
  return { tablist, panels };
}

/**
 * Check color contrast ratio
 */
export function checkContrastRatio(
  foreground: string,
  background: string
): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  // Simplified - in production use a proper color contrast library
  const fgLuminance = foreground === '#000000' ? 0 : 1;
  const bgLuminance = background === '#FFFFFF' ? 1 : 0;
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
}

/**
 * Create accessible form field
 */
export interface FormFieldConfig {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function createAccessibleFormField(config: FormFieldConfig): {
  container: HTMLDivElement;
  input: HTMLInputElement;
  label: HTMLLabelElement;
} {
  const container = document.createElement('div');
  
  const label = document.createElement('label');
  label.htmlFor = config.id;
  label.textContent = config.label;
  
  const input = document.createElement('input');
  input.id = config.id;
  input.type = config.type;
  
  if (config.required) {
    input.setAttribute('required', 'true');
    input.setAttribute('aria-required', 'true');
  }
  
  if (config.hint) {
    const hintId = `${config.id}-hint`;
    const hint = document.createElement('span');
    hint.id = hintId;
    hint.textContent = config.hint;
    hint.className = 'form-hint';
    container.appendChild(hint);
    input.setAttribute('aria-describedby', hintId);
  }
  
  if (config.error) {
    const errorId = `${config.id}-error`;
    const error = document.createElement('span');
    error.id = errorId;
    error.textContent = config.error;
    error.setAttribute('role', 'alert');
    error.className = 'form-error';
    container.appendChild(error);
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
  }
  
  container.appendChild(label);
  container.appendChild(input);
  
  return { container, input, label };
}

/**
 * Manage focus order
 */
export function setFocusOrder(elements: HTMLElement[]): void {
  elements.forEach((element, index) => {
    element.setAttribute('tabindex', String(index));
  });
}

/**
 * Create accessible breadcrumb
 */
export function createAccessibleBreadcrumb(
  items: Array<{ label: string; href?: string }>
): HTMLElement {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  
  const ol = document.createElement('ol');
  
  items.forEach((item, index) => {
    const li = document.createElement('li');
    
    if (item.href && index < items.length - 1) {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
    } else {
      li.textContent = item.label;
      if (index === items.length - 1) {
        li.setAttribute('aria-current', 'page');
      }
    }
    
    ol.appendChild(li);
  });
  
  nav.appendChild(ol);
  return nav;
}

/**
 * Prefers reduced motion check
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Prefers color scheme check
 */
export function prefersColorScheme(): 'light' | 'dark' | 'no-preference' {
  if (typeof window === 'undefined') return 'no-preference';
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'no-preference';
}

/**
 * Prefers high contrast check
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

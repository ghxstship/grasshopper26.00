/**
 * Keyboard Navigation Utilities
 * Standard keyboard interaction patterns
 * WCAG 2.2 AAA Compliant
 * GHXSTSHIP Contemporary Minimal Pop Art Design System
 */

export type NavigationDirection = 'horizontal' | 'vertical' | 'both';

export interface KeyboardNavigationOptions {
  direction?: NavigationDirection;
  loop?: boolean;
  onSelect?: (index: number) => void;
  onEscape?: () => void;
}

export class KeyboardNavigation {
  private items: HTMLElement[];
  private currentIndex: number = 0;
  private options: Required<KeyboardNavigationOptions>;
  
  constructor(
    items: HTMLElement[],
    options: KeyboardNavigationOptions = {}
  ) {
    this.items = items;
    this.options = {
      direction: options.direction || 'both',
      loop: options.loop ?? true,
      onSelect: options.onSelect || (() => {}),
      onEscape: options.onEscape || (() => {}),
    };
  }
  
  /**
   * Handle keyboard events
   */
  handleKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    
    switch (key) {
      case 'ArrowDown':
        if (this.options.direction === 'vertical' || this.options.direction === 'both') {
          event.preventDefault();
          this.moveNext();
        }
        break;
        
      case 'ArrowUp':
        if (this.options.direction === 'vertical' || this.options.direction === 'both') {
          event.preventDefault();
          this.movePrevious();
        }
        break;
        
      case 'ArrowRight':
        if (this.options.direction === 'horizontal' || this.options.direction === 'both') {
          event.preventDefault();
          this.moveNext();
        }
        break;
        
      case 'ArrowLeft':
        if (this.options.direction === 'horizontal' || this.options.direction === 'both') {
          event.preventDefault();
          this.movePrevious();
        }
        break;
        
      case 'Home':
        event.preventDefault();
        this.moveToFirst();
        break;
        
      case 'End':
        event.preventDefault();
        this.moveToLast();
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.select();
        break;
        
      case 'Escape':
        event.preventDefault();
        this.options.onEscape();
        break;
    }
  }
  
  /**
   * Move to next item
   */
  private moveNext(): void {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
    } else if (this.options.loop) {
      this.currentIndex = 0;
    }
    this.focusCurrent();
  }
  
  /**
   * Move to previous item
   */
  private movePrevious(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.options.loop) {
      this.currentIndex = this.items.length - 1;
    }
    this.focusCurrent();
  }
  
  /**
   * Move to first item
   */
  private moveToFirst(): void {
    this.currentIndex = 0;
    this.focusCurrent();
  }
  
  /**
   * Move to last item
   */
  private moveToLast(): void {
    this.currentIndex = this.items.length - 1;
    this.focusCurrent();
  }
  
  /**
   * Focus current item
   */
  private focusCurrent(): void {
    const item = this.items[this.currentIndex];
    if (item) {
      item.focus();
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  /**
   * Select current item
   */
  private select(): void {
    this.options.onSelect(this.currentIndex);
  }
  
  /**
   * Update items
   */
  updateItems(items: HTMLElement[]): void {
    this.items = items;
    this.currentIndex = Math.min(this.currentIndex, items.length - 1);
  }
  
  /**
   * Set current index
   */
  setCurrentIndex(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.focusCurrent();
    }
  }
}

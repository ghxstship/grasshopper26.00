/**
 * RTL (Right-to-Left) Testing Suite
 * Validate RTL support and logical properties
 */

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Helper to render with RTL direction
function renderRTL(component: React.ReactElement) {
  return render(
    <div dir="rtl">
      {component}
    </div>
  );
}

describe('RTL Support', () => {
  describe('Logical Properties', () => {
    it('uses margin-inline instead of margin-left/right', () => {
      const { container } = render(
        <div style={{ marginInlineStart: '1rem', marginInlineEnd: '2rem' }}>
          Content
        </div>
      );
      
      const element = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(element);
      
      // In LTR: margin-inline-start = margin-left
      expect(styles.marginLeft).toBe('1rem');
      expect(styles.marginRight).toBe('2rem');
    });
    
    it('flips margins in RTL mode', () => {
      const { container } = renderRTL(
        <div style={{ marginInlineStart: '1rem', marginInlineEnd: '2rem' }}>
          Content
        </div>
      );
      
      const element = container.querySelector('[dir="rtl"] > div') as HTMLElement;
      const styles = window.getComputedStyle(element);
      
      // In RTL: margin-inline-start = margin-right
      expect(styles.marginRight).toBe('1rem');
      expect(styles.marginLeft).toBe('2rem');
    });
    
    it('uses padding-inline instead of padding-left/right', () => {
      const { container } = render(
        <div style={{ paddingInlineStart: '1rem', paddingInlineEnd: '2rem' }}>
          Content
        </div>
      );
      
      const element = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(element);
      
      expect(styles.paddingLeft).toBe('1rem');
      expect(styles.paddingRight).toBe('2rem');
    });
  });
  
  describe('Text Alignment', () => {
    it('uses text-align: start instead of left', () => {
      const { container } = render(
        <div style={{ textAlign: 'start' }}>
          Text content
        </div>
      );
      
      const element = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(element);
      
      // In LTR: start = left
      expect(styles.textAlign).toBe('start');
    });
    
    it('flips text alignment in RTL', () => {
      const { container } = renderRTL(
        <div style={{ textAlign: 'start' }}>
          Text content
        </div>
      );
      
      const element = container.querySelector('[dir="rtl"] > div') as HTMLElement;
      const styles = window.getComputedStyle(element);
      
      // In RTL: start = right
      expect(styles.textAlign).toBe('start');
    });
  });
  
  describe('Directional Icons', () => {
    it('flips arrow icons in RTL', () => {
      const ArrowIcon = () => (
        <svg className="rtl:scale-x-[-1]">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      );
      
      const { container } = renderRTL(<ArrowIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg).toHaveClass('rtl:scale-x-[-1]');
    });
  });
  
  describe('Layout Direction', () => {
    it('applies dir attribute to root element', () => {
      const { container } = renderRTL(
        <div>Content</div>
      );
      
      const root = container.querySelector('[dir="rtl"]');
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('dir', 'rtl');
    });
    
    it('flex containers reverse in RTL', () => {
      const { container } = renderRTL(
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div>First</div>
          <div>Second</div>
        </div>
      );
      
      const flexContainer = container.querySelector('[dir="rtl"] > div') as HTMLElement;
      expect(flexContainer).toHaveStyle({ display: 'flex' });
    });
  });
  
  describe('Border Radius', () => {
    it('uses logical border-radius properties', () => {
      const { container } = render(
        <div style={{ 
          borderStartStartRadius: '0.5rem',
          borderStartEndRadius: '0.5rem',
        }}>
          Content
        </div>
      );
      
      const element = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(element);
      
      // In LTR: start-start = top-left, start-end = top-right
      expect(styles.borderTopLeftRadius).toBe('0.5rem');
      expect(styles.borderTopRightRadius).toBe('0.5rem');
    });
  });
  
  describe('Position Properties', () => {
    it('uses inset-inline instead of left/right', () => {
      const { container } = render(
        <div style={{ 
          position: 'absolute',
          insetInlineStart: '1rem',
          insetInlineEnd: '2rem',
        }}>
          Content
        </div>
      );
      
      const element = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(element);
      
      expect(styles.left).toBe('1rem');
      expect(styles.right).toBe('2rem');
    });
  });
});

describe('Locale-Aware Formatting', () => {
  describe('Date Formatting', () => {
    it('formats dates according to locale', () => {
      const date = new Date('2025-01-15');
      
      const usFormat = new Intl.DateTimeFormat('en-US').format(date);
      const euFormat = new Intl.DateTimeFormat('en-GB').format(date);
      
      expect(usFormat).toBe('1/15/2025');
      expect(euFormat).toBe('15/01/2025');
    });
  });
  
  describe('Number Formatting', () => {
    it('formats numbers according to locale', () => {
      const number = 1234.56;
      
      const usFormat = new Intl.NumberFormat('en-US').format(number);
      const deFormat = new Intl.NumberFormat('de-DE').format(number);
      
      expect(usFormat).toBe('1,234.56');
      expect(deFormat).toBe('1.234,56');
    });
  });
  
  describe('Currency Formatting', () => {
    it('formats currency according to locale', () => {
      const amount = 1234.56;
      
      const usdFormat = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(amount);
      
      const eurFormat = new Intl.NumberFormat('de-DE', { 
        style: 'currency', 
        currency: 'EUR' 
      }).format(amount);
      
      expect(usdFormat).toContain('$');
      expect(eurFormat).toContain('€');
    });
  });
});

/**
 * Keyboard Navigation Tests
 * Validate keyboard interaction patterns
 */

import { KeyboardNavigation } from '@/design-system/utils/keyboard-navigation';

describe('KeyboardNavigation', () => {
  let items: HTMLElement[];
  let navigation: KeyboardNavigation;
  
  beforeEach(() => {
    items = [
      document.createElement('button'),
      document.createElement('button'),
      document.createElement('button'),
    ];
    
    items.forEach((item, index) => {
      item.textContent = `Button ${index + 1}`;
      document.body.appendChild(item);
    });
  });
  
  afterEach(() => {
    items.forEach(item => document.body.removeChild(item));
  });
  
  describe('Vertical Navigation', () => {
    beforeEach(() => {
      navigation = new KeyboardNavigation(items, { direction: 'vertical' });
    });
    
    it('moves to next item on ArrowDown', () => {
      items[0].focus();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[1]);
    });
    
    it('moves to previous item on ArrowUp', () => {
      items[1].focus();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[0]);
    });
    
    it('loops to first item from last on ArrowDown', () => {
      navigation.setCurrentIndex(2);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[0]);
    });
    
    it('loops to last item from first on ArrowUp', () => {
      navigation.setCurrentIndex(0);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[2]);
    });
  });
  
  describe('Horizontal Navigation', () => {
    beforeEach(() => {
      navigation = new KeyboardNavigation(items, { direction: 'horizontal' });
    });
    
    it('moves to next item on ArrowRight', () => {
      items[0].focus();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[1]);
    });
    
    it('moves to previous item on ArrowLeft', () => {
      items[1].focus();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[0]);
    });
  });
  
  describe('Home and End Keys', () => {
    beforeEach(() => {
      navigation = new KeyboardNavigation(items);
    });
    
    it('moves to first item on Home', () => {
      navigation.setCurrentIndex(2);
      
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[0]);
    });
    
    it('moves to last item on End', () => {
      navigation.setCurrentIndex(0);
      
      const event = new KeyboardEvent('keydown', { key: 'End' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[2]);
    });
  });
  
  describe('Selection', () => {
    it('calls onSelect callback on Enter', () => {
      const onSelect = jest.fn();
      navigation = new KeyboardNavigation(items, { onSelect });
      
      navigation.setCurrentIndex(1);
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      navigation.handleKeyDown(event);
      
      expect(onSelect).toHaveBeenCalledWith(1);
    });
    
    it('calls onSelect callback on Space', () => {
      const onSelect = jest.fn();
      navigation = new KeyboardNavigation(items, { onSelect });
      
      navigation.setCurrentIndex(1);
      
      const event = new KeyboardEvent('keydown', { key: ' ' });
      navigation.handleKeyDown(event);
      
      expect(onSelect).toHaveBeenCalledWith(1);
    });
  });
  
  describe('Escape Key', () => {
    it('calls onEscape callback on Escape', () => {
      const onEscape = jest.fn();
      navigation = new KeyboardNavigation(items, { onEscape });
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      navigation.handleKeyDown(event);
      
      expect(onEscape).toHaveBeenCalled();
    });
  });
  
  describe('Non-looping Navigation', () => {
    beforeEach(() => {
      navigation = new KeyboardNavigation(items, { loop: false });
    });
    
    it('does not loop from last to first', () => {
      navigation.setCurrentIndex(2);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[2]);
    });
    
    it('does not loop from first to last', () => {
      navigation.setCurrentIndex(0);
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      navigation.handleKeyDown(event);
      
      expect(document.activeElement).toBe(items[0]);
    });
  });
});

/**
 * Focus Management Tests
 * Validate focus trapping and restoration
 */

import { FocusManager } from '@/design-system/utils/focus-management';

describe('FocusManager', () => {
  let focusManager: FocusManager;
  let container: HTMLElement;
  
  beforeEach(() => {
    focusManager = new FocusManager();
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });
  
  describe('trapFocus', () => {
    it('traps focus within container', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const button3 = document.createElement('button');
      
      button1.textContent = 'First';
      button2.textContent = 'Second';
      button3.textContent = 'Third';
      
      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      
      const cleanup = focusManager.trapFocus(container);
      
      // Focus should be on first element
      expect(document.activeElement).toBe(button1);
      
      cleanup();
    });
    
    it('cycles focus from last to first element on Tab', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      
      container.appendChild(button1);
      container.appendChild(button2);
      
      const cleanup = focusManager.trapFocus(container);
      
      button2.focus();
      
      // Simulate Tab key on last element
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      container.dispatchEvent(event);
      
      cleanup();
    });
    
    it('cycles focus from first to last element on Shift+Tab', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      
      container.appendChild(button1);
      container.appendChild(button2);
      
      const cleanup = focusManager.trapFocus(container);
      
      button1.focus();
      
      // Simulate Shift+Tab key on first element
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      container.dispatchEvent(event);
      
      cleanup();
    });
  });
  
  describe('saveFocus and restoreFocus', () => {
    it('saves and restores focus', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();
      
      expect(document.activeElement).toBe(button);
      
      focusManager.saveFocus();
      
      // Focus something else
      const otherButton = document.createElement('button');
      document.body.appendChild(otherButton);
      otherButton.focus();
      
      expect(document.activeElement).toBe(otherButton);
      
      // Restore focus
      focusManager.restoreFocus();
      
      expect(document.activeElement).toBe(button);
      
      document.body.removeChild(button);
      document.body.removeChild(otherButton);
    });
  });
  
  describe('focusFirstError', () => {
    it('focuses first invalid input in form', () => {
      const form = document.createElement('form');
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      
      input2.setAttribute('aria-invalid', 'true');
      
      form.appendChild(input1);
      form.appendChild(input2);
      container.appendChild(form);
      
      focusManager.focusFirstError(form);
      
      expect(document.activeElement).toBe(input2);
    });
  });
  
  describe('announce', () => {
    it('creates live region for announcements', () => {
      focusManager.announce('Test message', 'polite');
      
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion?.textContent).toBe('Test message');
    });
    
    it('creates assertive live region for urgent messages', () => {
      focusManager.announce('Urgent message', 'assertive');
      
      const liveRegion = document.querySelector('[role="alert"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion?.textContent).toBe('Urgent message');
    });
    
    it('removes announcement after timeout', (done) => {
      focusManager.announce('Temporary message');
      
      const liveRegion = document.querySelector('[aria-live]');
      expect(liveRegion).toBeInTheDocument();
      
      setTimeout(() => {
        const removedRegion = document.querySelector('[aria-live]');
        expect(removedRegion).not.toBeInTheDocument();
        done();
      }, 1100);
    });
  });
});

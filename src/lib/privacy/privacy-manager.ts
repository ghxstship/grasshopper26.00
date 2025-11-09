/**
 * Data Privacy Utilities
 * GDPR/CCPA compliance helpers
 */

/* eslint-disable no-magic-numbers */
// Privacy and hashing constants (IP masking, hash lengths)

import type { CookiePreferences } from '@/components/privacy/cookie-consent';

export class PrivacyManager {
  private static STORAGE_KEY = 'cookie-preferences';
  
  /**
   * Check if user has consented to specific cookie category
   */
  static hasConsent(category: keyof CookiePreferences): boolean {
    const preferences = this.getPreferences();
    return preferences?.[category] ?? false;
  }
  
  /**
   * Get saved cookie preferences
   */
  static getPreferences(): CookiePreferences | null {
    if (typeof window === 'undefined') return null;
    
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }
  
  /**
   * Update cookie preferences
   */
  static setPreferences(preferences: CookiePreferences): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent('cookie-preferences-updated', { 
      detail: preferences 
    }));
  }
  
  /**
   * Clear all preferences (for testing)
   */
  static clearPreferences(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  /**
   * Anonymize IP address for GDPR compliance
   */
  static anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      // IPv4: Replace last octet
      return `${parts.slice(0, 3).join('.')}.0`;
    }
    // IPv6: Truncate last 80 bits
    const ipv6Parts = ip.split(':');
    return ipv6Parts.slice(0, 4).join(':') + '::';
  }
  
  /**
   * Hash PII for pseudonymization
   */
  static async hashPII(value: string): Promise<string> {
    if (typeof window === 'undefined') return value;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Pseudonymize user data for analytics
   */
  static pseudonymize(data: Record<string, any>): Record<string, any> {
    const pseudo = { ...data };
    
    // Remove or hash PII
    const piiFields = ['email', 'name', 'phone', 'address', 'ip'];
    piiFields.forEach(field => {
      if (pseudo[field]) {
        delete pseudo[field];
      }
    });
    
    return pseudo;
  }
  
  /**
   * Check if analytics should be loaded
   */
  static shouldLoadAnalytics(): boolean {
    return this.hasConsent('analytics');
  }
  
  /**
   * Check if marketing scripts should be loaded
   */
  static shouldLoadMarketing(): boolean {
    return this.hasConsent('marketing');
  }
}

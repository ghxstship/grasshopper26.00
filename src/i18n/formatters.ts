/**
 * Locale-aware Formatting Utilities
 * GDPR/CCPA compliant data formatting
 */

/* eslint-disable no-magic-numbers */
// Time conversion constants (60 seconds, 24 hours, etc.) and locale formatting
/**
 * Internationalization Formatters
 * Locale-aware formatting utilities
 */

export class Formatters {
  private locale: string;
  
  constructor(locale: string) {
    this.locale = locale;
  }
  
  /**
   * Format date according to locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: 'medium',
      ...options,
    }).format(date);
  }
  
  /**
   * Format date and time
   */
  formatDateTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options,
    }).format(date);
  }
  
  /**
   * Format time only
   */
  formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      timeStyle: 'short',
      ...options,
    }).format(date);
  }
  
  /**
   * Format number according to locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }
  
  /**
   * Format currency according to locale
   */
  formatCurrency(
    value: number, 
    currency: string = 'USD',
    options?: Intl.NumberFormatOptions
  ): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
      ...options,
    }).format(value);
  }
  
  /**
   * Format percentage
   */
  formatPercent(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options,
    }).format(value);
  }
  
  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(
    value: number, 
    unit: Intl.RelativeTimeFormatUnit
  ): string {
    return new Intl.RelativeTimeFormat(this.locale, {
      numeric: 'auto',
    }).format(value, unit);
  }
  
  /**
   * Format list according to locale
   */
  formatList(items: string[], options?: Intl.ListFormatOptions): string {
    return new Intl.ListFormat(this.locale, {
      style: 'long',
      type: 'conjunction',
      ...options,
    }).format(items);
  }
  
  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${this.formatNumber(size, { maximumFractionDigits: 2 })} ${units[unitIndex]}`;
  }
  
  /**
   * Format duration (milliseconds to human readable)
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return this.formatRelativeTime(days, 'day');
    } else if (hours > 0) {
      return this.formatRelativeTime(hours, 'hour');
    } else if (minutes > 0) {
      return this.formatRelativeTime(minutes, 'minute');
    } else {
      return this.formatRelativeTime(seconds, 'second');
    }
  }
  
  /**
   * Format phone number (basic)
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length (US format as example)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phoneNumber;
  }
}

/**
 * Get formatter instance for locale
 */
export function getFormatter(locale: string): Formatters {
  return new Formatters(locale);
}

/**
 * Locale-aware Formatting Utilities
 * Format dates, numbers, currency, and relative time according to locale
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
   * Format date and time according to locale
   */
  formatDateTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options,
    }).format(date);
  }
  
  /**
   * Format time according to locale
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
   * Format percentage according to locale
   */
  formatPercent(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
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
   * Get relative time from date
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return this.formatRelativeTime(-diffInSeconds, 'seconds');
    } else if (diffInSeconds < 3600) {
      return this.formatRelativeTime(-Math.floor(diffInSeconds / 60), 'minutes');
    } else if (diffInSeconds < 86400) {
      return this.formatRelativeTime(-Math.floor(diffInSeconds / 3600), 'hours');
    } else if (diffInSeconds < 2592000) {
      return this.formatRelativeTime(-Math.floor(diffInSeconds / 86400), 'days');
    } else if (diffInSeconds < 31536000) {
      return this.formatRelativeTime(-Math.floor(diffInSeconds / 2592000), 'months');
    } else {
      return this.formatRelativeTime(-Math.floor(diffInSeconds / 31536000), 'years');
    }
  }
}

// Factory function
export const createFormatters = (locale: string): Formatters => {
  return new Formatters(locale);
};

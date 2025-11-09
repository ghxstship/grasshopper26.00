/**
 * Analytics Integration
 * Google Analytics and custom event tracking
 */

// Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track membership events
export const trackMembershipEvent = (action: 'subscribe' | 'upgrade' | 'cancel', tier: string) => {
  event({
    action,
    category: 'Membership',
    label: tier,
  });
};

// Track ticket events
export const trackTicketEvent = (action: 'purchase' | 'transfer' | 'scan', eventId: string) => {
  event({
    action,
    category: 'Tickets',
    label: eventId,
  });
};

// Track e-commerce events
export const trackPurchase = (transactionId: string, value: number, items: string[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'USD',
      items: items,
    });
  }
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

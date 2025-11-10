/**
 * Analytics Helper Utilities
 * GHXSTSHIP Entertainment Platform Analytics Tracking
 */

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}

export interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
}

/**
 * Track page view
 */
export function trackPageView(event: PageViewEvent): void {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if ('gtag' in window) {
    (window as any).gtag('event', 'page_view', {
      page_path: event.path,
      page_title: event.title,
      page_referrer: event.referrer,
    });
  }

  // Custom analytics
  console.log('Page View:', event);
}

/**
 * Track event
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if ('gtag' in window) {
    (window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      non_interaction: event.nonInteraction,
    });
  }

  // Custom analytics
  console.log('Event:', event);
}

/**
 * Track ticket purchase
 */
export function trackTicketPurchase(
  eventId: string,
  ticketType: string,
  quantity: number,
  totalPrice: number
): void {
  trackEvent({
    category: 'Ecommerce',
    action: 'Purchase',
    label: `${eventId}-${ticketType}`,
    value: totalPrice,
  });

  // Enhanced ecommerce
  if ('gtag' in window) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: `T-${Date.now()}`,
      value: totalPrice,
      currency: 'USD',
      items: [{
        item_id: eventId,
        item_name: ticketType,
        quantity,
        price: totalPrice / quantity,
      }],
    });
  }
}

/**
 * Track event view
 */
export function trackEventView(eventId: string, eventName: string): void {
  trackEvent({
    category: 'Events',
    action: 'View',
    label: `${eventId}-${eventName}`,
  });
}

/**
 * Track artist view
 */
export function trackArtistView(artistId: string, artistName: string): void {
  trackEvent({
    category: 'Artists',
    action: 'View',
    label: `${artistId}-${artistName}`,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount: number): void {
  trackEvent({
    category: 'Search',
    action: 'Query',
    label: query,
    value: resultsCount,
  });
}

/**
 * Track social share
 */
export function trackSocialShare(platform: string, contentType: string, contentId: string): void {
  trackEvent({
    category: 'Social',
    action: 'Share',
    label: `${platform}-${contentType}-${contentId}`,
  });
}

/**
 * Track video play
 */
export function trackVideoPlay(videoId: string, videoTitle: string): void {
  trackEvent({
    category: 'Video',
    action: 'Play',
    label: `${videoId}-${videoTitle}`,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string, success: boolean): void {
  trackEvent({
    category: 'Forms',
    action: success ? 'Submit Success' : 'Submit Error',
    label: formName,
  });
}

/**
 * Track error
 */
export function trackError(errorMessage: string, errorLocation: string): void {
  trackEvent({
    category: 'Errors',
    action: errorLocation,
    label: errorMessage,
    nonInteraction: true,
  });
}

/**
 * Track timing
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  if ('gtag' in window) {
    (window as any).gtag('event', 'timing_complete', {
      name: variable,
      value,
      event_category: category,
      event_label: label,
    });
  }
}

/**
 * Track user engagement
 */
export function trackEngagement(action: string, value?: number): void {
  trackEvent({
    category: 'Engagement',
    action,
    value,
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, string | number>): void {
  if ('gtag' in window) {
    (window as any).gtag('set', 'user_properties', properties);
  }
}

/**
 * Identify user
 */
export function identifyUser(userId: string): void {
  if ('gtag' in window) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: userId,
    });
  }
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: number): void {
  trackEvent({
    category: 'Engagement',
    action: 'Scroll Depth',
    label: `${depth}%`,
    value: depth,
    nonInteraction: true,
  });
}

/**
 * Create scroll depth tracker
 */
export function createScrollDepthTracker(thresholds: number[] = [25, 50, 75, 100]): () => void {
  const tracked = new Set<number>();

  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const percentage = Math.round((scrolled / scrollHeight) * 100);

    thresholds.forEach(threshold => {
      if (percentage >= threshold && !tracked.has(threshold)) {
        tracked.add(threshold);
        trackScrollDepth(threshold);
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

/**
 * Track click
 */
export function trackClick(elementType: string, elementId: string, elementText?: string): void {
  trackEvent({
    category: 'Clicks',
    action: elementType,
    label: elementText || elementId,
  });
}

/**
 * Track outbound link
 */
export function trackOutboundLink(url: string): void {
  trackEvent({
    category: 'Outbound Links',
    action: 'Click',
    label: url,
  });
}

/**
 * Track download
 */
export function trackDownload(filename: string, fileType: string): void {
  trackEvent({
    category: 'Downloads',
    action: fileType,
    label: filename,
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(source: string): void {
  trackEvent({
    category: 'Newsletter',
    action: 'Signup',
    label: source,
  });
}

/**
 * Track ticket add to cart
 */
export function trackAddToCart(
  eventId: string,
  ticketType: string,
  quantity: number,
  price: number
): void {
  if ('gtag' in window) {
    (window as any).gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: price * quantity,
      items: [{
        item_id: eventId,
        item_name: ticketType,
        quantity,
        price,
      }],
    });
  }
}

/**
 * Track checkout begin
 */
export function trackBeginCheckout(
  items: Array<{ id: string; name: string; quantity: number; price: number }>,
  totalValue: number
): void {
  if ('gtag' in window) {
    (window as any).gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: totalValue,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  }
}

/**
 * Track performance metrics
 */
export function trackPerformanceMetrics(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (navigation) {
    trackTiming('Performance', 'DNS Lookup', navigation.domainLookupEnd - navigation.domainLookupStart);
    trackTiming('Performance', 'TCP Connection', navigation.connectEnd - navigation.connectStart);
    trackTiming('Performance', 'Server Response', navigation.responseStart - navigation.requestStart);
    trackTiming('Performance', 'DOM Content Loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
    trackTiming('Performance', 'Page Load', navigation.loadEventEnd - navigation.loadEventStart);
  }
}

/**
 * Track web vitals
 */
export function trackWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
}): void {
  trackTiming('Web Vitals', metric.name, Math.round(metric.value), metric.id);
}

/**
 * Initialize analytics
 */
export function initializeAnalytics(measurementId: string): void {
  if (typeof window === 'undefined') return;

  // Load Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function() {
    (window as any).dataLayer.push(arguments);
  };
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', measurementId);
}

// Analytics event tracking utilities

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Vercel Analytics
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', eventName, properties);
  }

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, properties);
  }
};

export const analyticsEvents = {
  // Page views
  pageView: (page: string) => {
    trackEvent('page_view', { page });
  },

  // Event interactions
  eventView: (eventId: string, eventName: string) => {
    trackEvent('event_view', { event_id: eventId, event_name: eventName });
  },

  eventShare: (eventId: string, platform: string) => {
    trackEvent('event_share', { event_id: eventId, platform });
  },

  // Ticket purchases
  addToCart: (ticketTypeId: string, quantity: number, price: number) => {
    trackEvent('add_to_cart', {
      ticket_type_id: ticketTypeId,
      quantity,
      value: price * quantity,
    });
  },

  beginCheckout: (totalValue: number, itemCount: number) => {
    trackEvent('begin_checkout', {
      value: totalValue,
      items: itemCount,
    });
  },

  purchase: (orderId: string, totalValue: number, ticketCount: number) => {
    trackEvent('purchase', {
      transaction_id: orderId,
      value: totalValue,
      items: ticketCount,
    });
  },

  // Artist interactions
  artistView: (artistId: string, artistName: string) => {
    trackEvent('artist_view', { artist_id: artistId, artist_name: artistName });
  },

  artistFollow: (artistId: string) => {
    trackEvent('artist_follow', { artist_id: artistId });
  },

  // User actions
  signup: (method: string) => {
    trackEvent('sign_up', { method });
  },

  login: (method: string) => {
    trackEvent('login', { method });
  },

  // Search
  search: (query: string, resultCount: number) => {
    trackEvent('search', { search_term: query, results: resultCount });
  },

  // Social
  socialClick: (platform: string, location: string) => {
    trackEvent('social_click', { platform, location });
  },
};

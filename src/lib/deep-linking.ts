/**
 * Deep Linking Utilities
 * Provides utilities for generating and parsing deep links across the application
 */

export interface DeepLinkParams {
  [key: string]: string | number | boolean | undefined
}

export interface DeepLinkConfig {
  path: string
  params?: DeepLinkParams
  hash?: string
  preserveQuery?: boolean
}

/**
 * Generate a deep link URL with query parameters and hash
 */
export function generateDeepLink(config: DeepLinkConfig): string {
  const { path, params = {}, hash, preserveQuery = false } = config
  
  const url = new URL(path, typeof window !== "undefined" ? window.location.origin : "https://gvteway.com")
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })
  
  // Add hash if provided
  if (hash) {
    url.hash = hash.startsWith("#") ? hash : `#${hash}`
  }
  
  return url.pathname + url.search + url.hash
}

/**
 * Parse deep link parameters from URL
 */
export function parseDeepLink(url: string): {
  path: string
  params: Record<string, string>
  hash: string | null
} {
  const urlObj = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://gvteway.com")
  
  const params: Record<string, string> = {}
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return {
    path: urlObj.pathname,
    params,
    hash: urlObj.hash ? urlObj.hash.slice(1) : null,
  }
}

/**
 * Deep link generators for common routes
 */
export const deepLinks = {
  // Event deep links
  event: (eventId: string, params?: { section?: string; ticketType?: string }) =>
    generateDeepLink({
      path: `/events/${eventId}`,
      params,
    }),
  
  eventCheckout: (eventId: string, ticketType?: string) =>
    generateDeepLink({
      path: `/checkout`,
      params: { event: eventId, ticketType },
    }),
  
  // Artist deep links
  artist: (artistSlug: string, params?: { tab?: string }) =>
    generateDeepLink({
      path: `/artists/${artistSlug}`,
      params,
    }),
  
  // Product deep links
  product: (productSlug: string, params?: { variant?: string }) =>
    generateDeepLink({
      path: `/shop/${productSlug}`,
      params,
    }),
  
  // Order deep links
  order: (orderId: string, params?: { highlight?: string }) =>
    generateDeepLink({
      path: `/orders/${orderId}`,
      params,
    }),
  
  // Admin deep links
  adminEvent: (eventId: string, action?: "edit" | "tickets") =>
    generateDeepLink({
      path: action ? `/admin/events/${eventId}/${action}` : `/admin/events/${eventId}`,
    }),
  
  adminOrder: (orderId: string, action?: "refund") =>
    generateDeepLink({
      path: action ? `/admin/orders/${orderId}/${action}` : `/admin/orders/${orderId}`,
    }),
  
  // News deep links
  newsArticle: (articleSlug: string, params?: { comment?: string }) =>
    generateDeepLink({
      path: `/news/${articleSlug}`,
      params,
      hash: params?.comment ? `comment-${params.comment}` : undefined,
    }),
  
  // User profile deep links
  profile: (section?: "orders" | "favorites" | "settings") =>
    generateDeepLink({
      path: section ? `/profile/${section}` : "/profile",
    }),
  
  // Membership deep links
  membership: (tier?: string) =>
    generateDeepLink({
      path: "/membership",
      params: { tier },
    }),
  
  membershipCheckout: (tier: string) =>
    generateDeepLink({
      path: "/membership/checkout",
      params: { tier },
    }),
  
  // Schedule deep links
  schedule: (params?: { date?: string; filter?: string }) =>
    generateDeepLink({
      path: "/schedule",
      params,
    }),
  
  // Cart deep links
  cart: (params?: { promo?: string }) =>
    generateDeepLink({
      path: "/cart",
      params,
    }),
}

/**
 * Generate shareable deep link with UTM parameters
 */
export function generateShareableLink(
  path: string,
  params?: {
    source?: string
    medium?: string
    campaign?: string
    content?: string
  }
): string {
  const utmParams: DeepLinkParams = {}
  
  if (params?.source) utmParams.utm_source = params.source
  if (params?.medium) utmParams.utm_medium = params.medium
  if (params?.campaign) utmParams.utm_campaign = params.campaign
  if (params?.content) utmParams.utm_content = params.content
  
  return generateDeepLink({ path, params: utmParams })
}

/**
 * Check if a URL is an internal deep link
 */
export function isInternalLink(url: string): boolean {
  try {
    const urlObj = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://gvteway.com")
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://gvteway.com"
    return urlObj.origin === currentOrigin
  } catch {
    // Relative URLs are internal
    return !url.startsWith("http://") && !url.startsWith("https://")
  }
}

/**
 * Preserve current query parameters when navigating
 */
export function preserveQueryParams(
  newPath: string,
  paramsToPreserve: string[] = []
): string {
  if (typeof window === "undefined") return newPath
  
  const currentParams = new URLSearchParams(window.location.search)
  const newUrl = new URL(newPath, window.location.origin)
  
  paramsToPreserve.forEach(param => {
    const value = currentParams.get(param)
    if (value) {
      newUrl.searchParams.set(param, value)
    }
  })
  
  return newUrl.pathname + newUrl.search
}

/**
 * Generate a return URL for authentication flows
 */
export function generateReturnUrl(currentPath?: string): string {
  const path = currentPath || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/")
  return encodeURIComponent(path)
}

/**
 * Parse and validate return URL
 */
export function parseReturnUrl(returnUrl?: string | null): string {
  if (!returnUrl) return "/"
  
  try {
    const decoded = decodeURIComponent(returnUrl)
    // Ensure it's an internal link
    if (isInternalLink(decoded)) {
      return decoded
    }
  } catch {
    // Invalid URL
  }
  
  return "/"
}

/**
 * URL Helper Utilities
 * GHXSTSHIP Entertainment Platform URL Management
 */

/**
 * Build URL with params
 */
export function buildUrl(base: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return base;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Parse URL params
 */
export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URL(url).searchParams;

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Get URL param
 */
export function getUrlParam(url: string, param: string): string | null {
  const searchParams = new URL(url).searchParams;
  return searchParams.get(param);
}

/**
 * Add URL param
 */
export function addUrlParam(url: string, key: string, value: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.set(key, value);
  return urlObj.toString();
}

/**
 * Remove URL param
 */
export function removeUrlParam(url: string, key: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.delete(key);
  return urlObj.toString();
}

/**
 * Get URL path segments
 */
export function getPathSegments(url: string): string[] {
  const urlObj = new URL(url);
  return urlObj.pathname.split('/').filter(Boolean);
}

/**
 * Join URL paths
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map(path => path.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

/**
 * Get URL hash
 */
export function getUrlHash(url: string): string {
  return new URL(url).hash.slice(1);
}

/**
 * Set URL hash
 */
export function setUrlHash(url: string, hash: string): string {
  const urlObj = new URL(url);
  urlObj.hash = hash;
  return urlObj.toString();
}

/**
 * Is absolute URL
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Is relative URL
 */
export function isRelativeUrl(url: string): boolean {
  return !isAbsoluteUrl(url);
}

/**
 * Make absolute URL
 */
export function makeAbsoluteUrl(url: string, baseUrl: string): string {
  if (isAbsoluteUrl(url)) return url;
  return new URL(url, baseUrl).toString();
}

/**
 * Get URL origin
 */
export function getUrlOrigin(url: string): string {
  return new URL(url).origin;
}

/**
 * Get URL pathname
 */
export function getUrlPathname(url: string): string {
  return new URL(url).pathname;
}

/**
 * Normalize URL
 */
export function normalizeUrl(url: string): string {
  const urlObj = new URL(url);

  // Remove trailing slash
  if (urlObj.pathname !== '/') {
    urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
  }

  // Sort query params
  const params = Array.from(urlObj.searchParams.entries()).sort();
  urlObj.search = new URLSearchParams(params).toString();

  return urlObj.toString();
}

/**
 * Compare URLs
 */
export function compareUrls(url1: string, url2: string): boolean {
  return normalizeUrl(url1) === normalizeUrl(url2);
}

/**
 * Encode URL component safely
 */
export function encodeUrlComponent(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, c =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/**
 * Decode URL component safely
 */
export function decodeUrlComponent(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Get current URL (client-side)
 */
export function getCurrentUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

/**
 * Navigate to URL (client-side)
 */
export function navigateToUrl(url: string, newTab: boolean = false): void {
  if (typeof window === 'undefined') return;

  if (newTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
}

/**
 * Reload page
 */
export function reloadPage(): void {
  if (typeof window === 'undefined') return;
  window.location.reload();
}

/**
 * Go back
 */
export function goBack(): void {
  if (typeof window === 'undefined') return;
  window.history.back();
}

/**
 * Go forward
 */
export function goForward(): void {
  if (typeof window === 'undefined') return;
  window.history.forward();
}

/**
 * Replace URL (without reload)
 */
export function replaceUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, '', url);
}

/**
 * Push URL (without reload)
 */
export function pushUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.history.pushState({}, '', url);
}

/**
 * Get referrer
 */
export function getReferrer(): string {
  if (typeof document === 'undefined') return '';
  return document.referrer;
}

/**
 * Copy URL to clipboard
 */
export async function copyUrlToClipboard(url?: string): Promise<boolean> {
  const urlToCopy = url || getCurrentUrl();

  try {
    await navigator.clipboard.writeText(urlToCopy);
    return true;
  } catch {
    return false;
  }
}

/**
 * Shorten URL display
 */
export function shortenUrlDisplay(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;

  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  const path = urlObj.pathname;

  if (domain.length + 3 >= maxLength) {
    return domain.slice(0, maxLength - 3) + '...';
  }

  const remainingLength = maxLength - domain.length - 3;
  const truncatedPath = path.slice(0, remainingLength);

  return `${domain}${truncatedPath}...`;
}

/**
 * Extract domain from URL
 */
export function extractUrlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Is same domain
 */
export function isSameDomain(url1: string, url2: string): boolean {
  return extractUrlDomain(url1) === extractUrlDomain(url2);
}

/**
 * Is external link
 */
export function isExternalLink(url: string, currentDomain?: string): boolean {
  if (isRelativeUrl(url)) return false;

  const domain = currentDomain || (typeof window !== 'undefined' ? window.location.hostname : '');
  return !isSameDomain(url, `https://${domain}`);
}

/**
 * Add UTM params
 */
export function addUtmParams(
  url: string,
  params: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  }
): string {
  const urlObj = new URL(url);

  if (params.source) urlObj.searchParams.set('utm_source', params.source);
  if (params.medium) urlObj.searchParams.set('utm_medium', params.medium);
  if (params.campaign) urlObj.searchParams.set('utm_campaign', params.campaign);
  if (params.term) urlObj.searchParams.set('utm_term', params.term);
  if (params.content) urlObj.searchParams.set('utm_content', params.content);

  return urlObj.toString();
}

/**
 * Parse UTM params
 */
export function parseUtmParams(url: string): {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
} {
  const urlObj = new URL(url);

  return {
    source: urlObj.searchParams.get('utm_source') || undefined,
    medium: urlObj.searchParams.get('utm_medium') || undefined,
    campaign: urlObj.searchParams.get('utm_campaign') || undefined,
    term: urlObj.searchParams.get('utm_term') || undefined,
    content: urlObj.searchParams.get('utm_content') || undefined,
  };
}

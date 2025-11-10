/**
 * SEO Helper Utilities
 * GHXSTSHIP Entertainment Platform SEO Optimization
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Generate page title
 */
export function generatePageTitle(title: string, siteName: string = 'GVTEWAY'): string {
  return `${title.toUpperCase()} | ${siteName}`;
}

/**
 * Truncate meta description
 */
export function truncateMetaDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength - 3) + '...';
}

/**
 * Generate meta tags
 */
export function generateMetaTags(metadata: SEOMetadata): Record<string, string> {
  const tags: Record<string, string> = {
    'title': metadata.title,
    'description': truncateMetaDescription(metadata.description),
  };

  if (metadata.keywords && metadata.keywords.length > 0) {
    tags['keywords'] = metadata.keywords.join(', ');
  }

  if (metadata.author) {
    tags['author'] = metadata.author;
  }

  return tags;
}

/**
 * Generate Open Graph tags
 */
export function generateOpenGraphTags(metadata: SEOMetadata): Record<string, string> {
  const tags: Record<string, string> = {
    'og:title': metadata.title,
    'og:description': truncateMetaDescription(metadata.description),
    'og:type': metadata.type || 'website',
  };

  if (metadata.image) {
    tags['og:image'] = metadata.image;
    tags['og:image:alt'] = metadata.title;
  }

  if (metadata.url) {
    tags['og:url'] = metadata.url;
  }

  if (metadata.siteName) {
    tags['og:site_name'] = metadata.siteName;
  }

  if (metadata.locale) {
    tags['og:locale'] = metadata.locale;
  }

  if (metadata.publishedTime) {
    tags['article:published_time'] = metadata.publishedTime;
  }

  if (metadata.modifiedTime) {
    tags['article:modified_time'] = metadata.modifiedTime;
  }

  return tags;
}

/**
 * Generate Twitter Card tags
 */
export function generateTwitterCardTags(metadata: SEOMetadata): Record<string, string> {
  const tags: Record<string, string> = {
    'twitter:card': 'summary_large_image',
    'twitter:title': metadata.title,
    'twitter:description': truncateMetaDescription(metadata.description),
  };

  if (metadata.image) {
    tags['twitter:image'] = metadata.image;
    tags['twitter:image:alt'] = metadata.title;
  }

  return tags;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

/**
 * Generate structured data (JSON-LD)
 */
export function generateEventStructuredData(event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: string;
  };
  image?: string;
  url?: string;
  offers?: {
    price: number;
    currency: string;
    url: string;
  };
}): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    location: {
      '@type': 'Place',
      name: event.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
      },
    },
    image: event.image ? [event.image] : undefined,
    url: event.url,
    offers: event.offers ? {
      '@type': 'Offer',
      price: event.offers.price,
      priceCurrency: event.offers.currency,
      url: event.offers.url,
      availability: 'https://schema.org/InStock',
    } : undefined,
  };

  return JSON.stringify(structuredData);
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData(org: {
  name: string;
  url: string;
  logo: string;
  description?: string;
  socialLinks?: string[];
}): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
    sameAs: org.socialLinks,
  };

  return JSON.stringify(structuredData);
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(structuredData);
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(
  url: string,
  lastmod?: string,
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
  priority?: number
): string {
  return `
    <url>
      <loc>${url}</loc>
      ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
      ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
      ${priority !== undefined ? `<priority>${priority}</priority>` : ''}
    </url>
  `.trim();
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(
  sitemapUrl: string,
  disallowPaths: string[] = []
): string {
  const disallowRules = disallowPaths.map(path => `Disallow: ${path}`).join('\n');

  return `
User-agent: *
${disallowRules || 'Disallow:'}

Sitemap: ${sitemapUrl}
  `.trim();
}

/**
 * Sanitize for SEO
 */
export function sanitizeForSEO(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate slug from title
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, count: number = 10): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Calculate reading time for SEO
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate meta robots tag
 */
export function generateMetaRobots(
  index: boolean = true,
  follow: boolean = true,
  additional?: string[]
): string {
  const directives = [
    index ? 'index' : 'noindex',
    follow ? 'follow' : 'nofollow',
    ...(additional || []),
  ];

  return directives.join(', ');
}

/**
 * Validate SEO metadata
 */
export function validateSEOMetadata(metadata: SEOMetadata): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!metadata.title) {
    warnings.push('Title is required');
  } else if (metadata.title.length > 60) {
    warnings.push('Title should be less than 60 characters');
  }

  if (!metadata.description) {
    warnings.push('Description is required');
  } else if (metadata.description.length > 160) {
    warnings.push('Description should be less than 160 characters');
  }

  if (!metadata.image) {
    warnings.push('Image is recommended for social sharing');
  }

  if (!metadata.url) {
    warnings.push('Canonical URL is recommended');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Generate hreflang tags
 */
export function generateHreflangTags(
  alternates: Array<{ locale: string; url: string }>
): Record<string, string> {
  const tags: Record<string, string> = {};

  alternates.forEach(alt => {
    tags[`hreflang-${alt.locale}`] = alt.url;
  });

  return tags;
}

/**
 * Generate AMP URL
 */
export function generateAMPUrl(url: string): string {
  return url.replace(/\/$/, '') + '/amp';
}

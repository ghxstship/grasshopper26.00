/**
 * Social Media Helper Utilities
 * GHXSTSHIP Entertainment Platform Social Integration
 */

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  spotify?: string;
  soundcloud?: string;
  website?: string;
}

/**
 * Get social platform from URL
 */
export function getSocialPlatform(url: string): keyof SocialLinks | null {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('facebook.com')) return 'facebook';
  if (lowerUrl.includes('instagram.com')) return 'instagram';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
  if (lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('youtube.com')) return 'youtube';
  if (lowerUrl.includes('spotify.com')) return 'spotify';
  if (lowerUrl.includes('soundcloud.com')) return 'soundcloud';
  
  return null;
}

/**
 * Format social handle
 */
export function formatSocialHandle(handle: string, platform: keyof SocialLinks): string {
  const cleaned = handle.replace(/^@/, '');
  
  switch (platform) {
    case 'twitter':
    case 'instagram':
    case 'tiktok':
      return `@${cleaned}`;
    default:
      return cleaned;
  }
}

/**
 * Get social profile URL
 */
export function getSocialProfileUrl(handle: string, platform: keyof SocialLinks): string {
  const cleaned = handle.replace(/^@/, '');
  
  const baseUrls: Record<keyof SocialLinks, string> = {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    twitter: 'https://twitter.com/',
    tiktok: 'https://tiktok.com/@',
    youtube: 'https://youtube.com/',
    spotify: 'https://open.spotify.com/artist/',
    soundcloud: 'https://soundcloud.com/',
    website: '',
  };
  
  return `${baseUrls[platform]}${cleaned}`;
}

/**
 * Extract username from social URL
 */
export function extractSocialUsername(url: string): string | null {
  const patterns = {
    facebook: /facebook\.com\/([^/?]+)/,
    instagram: /instagram\.com\/([^/?]+)/,
    twitter: /(?:twitter|x)\.com\/([^/?]+)/,
    tiktok: /tiktok\.com\/@([^/?]+)/,
    youtube: /youtube\.com\/(?:c\/|user\/|@)?([^/?]+)/,
    spotify: /spotify\.com\/artist\/([^/?]+)/,
    soundcloud: /soundcloud\.com\/([^/?]+)/,
  };
  
  for (const pattern of Object.values(patterns)) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Generate social share URL
 */
export function generateSocialShareUrl(
  platform: 'facebook' | 'twitter' | 'linkedin' | 'email',
  url: string,
  text?: string
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = text ? encodeURIComponent(text) : '';
  
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
  };
  
  return shareUrls[platform];
}

/**
 * Generate social meta tags
 */
export function generateSocialMetaTags(data: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}): Record<string, string> {
  return {
    // Open Graph
    'og:title': data.title,
    'og:description': data.description,
    'og:image': data.image,
    'og:url': data.url,
    'og:type': data.type || 'website',
    
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.image,
  };
}

/**
 * Validate social URL
 */
export function isValidSocialUrl(url: string, platform: keyof SocialLinks): boolean {
  const patterns: Record<keyof SocialLinks, RegExp> = {
    facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/,
    twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/,
    tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@.+/,
    youtube: /^https?:\/\/(www\.)?youtube\.com\/.+/,
    spotify: /^https?:\/\/open\.spotify\.com\/.+/,
    soundcloud: /^https?:\/\/(www\.)?soundcloud\.com\/.+/,
    website: /^https?:\/\/.+/,
  };
  
  return patterns[platform].test(url);
}

/**
 * Get social icon name (for icon components)
 */
export function getSocialIconName(platform: keyof SocialLinks): string {
  const iconNames: Record<keyof SocialLinks, string> = {
    facebook: 'facebook',
    instagram: 'instagram',
    twitter: 'twitter',
    tiktok: 'tiktok',
    youtube: 'youtube',
    spotify: 'spotify',
    soundcloud: 'soundcloud',
    website: 'globe',
  };
  
  return iconNames[platform];
}

/**
 * Sort social links by priority
 */
export function sortSocialLinks(links: SocialLinks): Array<[keyof SocialLinks, string]> {
  const priority: Array<keyof SocialLinks> = [
    'instagram',
    'twitter',
    'facebook',
    'tiktok',
    'youtube',
    'spotify',
    'soundcloud',
    'website',
  ];
  
  return priority
    .filter(platform => links[platform])
    .map(platform => [platform, links[platform]!]);
}

/**
 * Format follower count
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Generate hashtag
 */
export function generateHashtag(text: string): string {
  return `#${text.replace(/\s+/g, '').toUpperCase()}`;
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  return text.match(hashtagRegex) || [];
}

/**
 * Extract mentions from text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@[\w]+/g;
  return text.match(mentionRegex) || [];
}

/**
 * Create social share buttons data
 */
export function createShareButtons(url: string, title: string): Array<{
  platform: string;
  url: string;
  label: string;
}> {
  return [
    {
      platform: 'facebook',
      url: generateSocialShareUrl('facebook', url),
      label: 'SHARE ON FACEBOOK',
    },
    {
      platform: 'twitter',
      url: generateSocialShareUrl('twitter', url, title),
      label: 'SHARE ON TWITTER',
    },
    {
      platform: 'email',
      url: generateSocialShareUrl('email', url, title),
      label: 'SHARE VIA EMAIL',
    },
  ];
}

/**
 * Get social embed code
 */
export function getSocialEmbedCode(url: string, platform: keyof SocialLinks): string | null {
  switch (platform) {
    case 'instagram':
      return `<blockquote class="instagram-media" data-instgrm-permalink="${url}"></blockquote>`;
    case 'twitter':
      return `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`;
    case 'tiktok':
      return `<blockquote class="tiktok-embed" cite="${url}"></blockquote>`;
    default:
      return null;
  }
}

/**
 * Log social share (use analytics-helpers for tracking)
 */
export function logSocialShare(platform: string, url: string): void {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'share', {
      method: platform,
      content_type: 'url',
      item_id: url,
    });
  }
}

/**
 * Open social share popup
 */
export function openSharePopup(url: string, width: number = 600, height: number = 400): void {
  if (typeof window === 'undefined') return;
  
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
  );
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get social platform color (for GHXSTSHIP, convert to greyscale)
 */
export function getSocialPlatformColor(platform: keyof SocialLinks): string {
  // All colors converted to greyscale for GHXSTSHIP
  return '#000000';
}

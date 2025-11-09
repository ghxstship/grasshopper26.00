/**
 * Social Media Sharing
 * Generate share URLs for various platforms
 */

interface ShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

/**
 * Share on Twitter/X
 */
export function shareOnTwitter(data: ShareData): string {
  const params = new URLSearchParams({
    url: data.url,
    text: data.title,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Share on Facebook
 */
export function shareOnFacebook(data: ShareData): string {
  const params = new URLSearchParams({
    u: data.url,
  });

  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Share on LinkedIn
 */
export function shareOnLinkedIn(data: ShareData): string {
  const params = new URLSearchParams({
    url: data.url,
  });

  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Share via Email
 */
export function shareViaEmail(data: ShareData): string {
  const subject = encodeURIComponent(data.title);
  const body = encodeURIComponent(
    `${data.description || ''}\n\n${data.url}`
  );

  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Copy link to clipboard
 */
export async function copyToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Native Web Share API (mobile)
 */
export async function nativeShare(data: ShareData): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.description,
        url: data.url,
      });
      return true;
    } catch (error) {
      console.error('Failed to share:', error);
      return false;
    }
  }
  return false;
}

/**
 * Check if native share is available
 */
export function isNativeShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

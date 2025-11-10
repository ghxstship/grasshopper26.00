/**
 * String Helper Utilities
 * GHXSTSHIP Platform String Manipulation
 */

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize all words
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Convert to kebab case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert to snake case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert to camel case
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Convert to pascal case
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^[a-z]/, char => char.toUpperCase());
}

/**
 * Truncate string
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Truncate to word boundary
 */
export function truncateWords(str: string, maxWords: number, suffix: string = '...'): string {
  const words = str.split(/\s+/);
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ') + suffix;
}

/**
 * Strip HTML tags
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML
 */
export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Unescape HTML
 */
export function unescapeHtml(str: string): string {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || '';
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Pluralize word
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || `${word}s`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Parse query string
 */
export function parseQueryString(query: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(query);
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Build query string
 */
export function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  
  return searchParams.toString();
}

/**
 * Extract initials
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('');
}

/**
 * Mask string (for sensitive data)
 */
export function maskString(str: string, visibleChars: number = 4, maskChar: string = '*'): string {
  if (str.length <= visibleChars) return str;
  const visible = str.slice(-visibleChars);
  const masked = maskChar.repeat(str.length - visibleChars);
  return masked + visible;
}

/**
 * Highlight search term
 */
export function highlightSearchTerm(text: string, searchTerm: string, className: string = 'highlight'): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
}

/**
 * Word count
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Character count (excluding spaces)
 */
export function characterCount(str: string, includeSpaces: boolean = false): number {
  return includeSpaces ? str.length : str.replace(/\s/g, '').length;
}

/**
 * Reading time estimate
 */
export function estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = wordCount(text);
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Format reading time
 */
export function formatReadingTime(text: string): string {
  const minutes = estimateReadingTime(text);
  return `${minutes} MIN READ`;
}

/**
 * Excerpt from text
 */
export function excerpt(text: string, maxLength: number = 150): string {
  const stripped = stripHtml(text);
  return truncate(stripped, maxLength);
}

/**
 * Remove extra whitespace
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Pad string
 */
export function padString(str: string, length: number, char: string = ' ', position: 'start' | 'end' = 'end'): string {
  if (str.length >= length) return str;
  const padding = char.repeat(length - str.length);
  return position === 'start' ? padding + str : str + padding;
}

/**
 * Reverse string
 */
export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Check if string is palindrome
 */
export function isPalindrome(str: string): boolean {
  const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalized === reverseString(normalized);
}

/**
 * Levenshtein distance (string similarity)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * String similarity percentage
 */
export function stringSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return ((maxLength - distance) / maxLength) * 100;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string, format: string = '(###) ###-####'): string {
  const digits = phone.replace(/\D/g, '');
  let formatted = format;
  
  for (const digit of digits) {
    formatted = formatted.replace('#', digit);
  }
  
  return formatted.replace(/#/g, '');
}

/**
 * Format credit card
 */
export function formatCreditCard(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.match(/.{1,4}/g)?.join(' ') || digits;
}

/**
 * Obfuscate email
 */
export function obfuscateEmail(email: string): string {
  const [username, domain] = email.split('@');
  const visibleChars = Math.min(3, Math.floor(username.length / 2));
  const maskedUsername = username.slice(0, visibleChars) + '*'.repeat(username.length - visibleChars);
  return `${maskedUsername}@${domain}`;
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Check if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

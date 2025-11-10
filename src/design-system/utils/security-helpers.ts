/**
 * Security Helper Utilities
 * GHXSTSHIP Entertainment Platform Security & Validation
 */

/**
 * Sanitize HTML input
 */
export function sanitizeHtmlInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Escape HTML entities for security
 */
export function escapeHtmlSafe(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * Unescape HTML entities safely
 */
export function unescapeHtmlSafe(text: string): string {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || '';
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  return token === expectedToken;
}

/**
 * Generate random token
 */
export function generateRandomToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash string (simple)
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate password strength (security)
 */
export function validatePasswordSecurity(password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters required');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z\d]/.test(password)) score++;
  else feedback.push('Add special characters');

  const strength = score <= 2 ? 'weak' : score <= 3 ? 'fair' : score <= 4 ? 'good' : 'strong';

  return { score, strength, feedback };
}

/**
 * Check for SQL injection patterns
 */
export function hasSqlInjectionPattern(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /('|")(.*?)\1/g,
  ];

  return patterns.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function hasXssPattern(input: string): boolean {
  const patterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  return patterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize user input
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): {
  isValid: boolean;
  error?: string;
} {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension .${extension} is not allowed`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSize: number = 5 * 1024 * 1024): {
  isValid: boolean;
  error?: string;
} {
  return validateFileUpload(file, {
    maxSize,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  });
}

/**
 * Rate limit checker
 */
export class RateLimitChecker {
  private attempts = new Map<string, number[]>();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  clear(): void {
    this.attempts.clear();
  }
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return generateRandomToken(32);
}

/**
 * Validate origin
 */
export function validateOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

/**
 * Check if request is from same origin
 */
export function isSameOrigin(url: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const requestUrl = new URL(url);
    return requestUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Validate JWT structure (basic check)
 */
export function isValidJwtStructure(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Decode JWT payload (without verification)
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if JWT is expired
 */
export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload<{ exp?: number }>(token);
  if (!payload || !payload.exp) return true;

  return Date.now() >= payload.exp * 1000;
}

/**
 * Mask sensitive data
 */
export function maskSensitiveData(
  data: string,
  visibleStart: number = 0,
  visibleEnd: number = 4,
  maskChar: string = '*'
): string {
  if (data.length <= visibleStart + visibleEnd) return data;

  const start = data.slice(0, visibleStart);
  const end = data.slice(-visibleEnd);
  const masked = maskChar.repeat(data.length - visibleStart - visibleEnd);

  return `${start}${masked}${end}`;
}

/**
 * Generate secure random ID
 */
export function generateSecureId(): string {
  return `${Date.now()}-${generateRandomToken(16)}`;
}

/**
 * Validate API key format
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  return /^[a-zA-Z0-9_-]{32,}$/.test(apiKey);
}

/**
 * Check content security policy
 */
export function checkCsp(directive: string, source: string): boolean {
  if (typeof document === 'undefined') return true;

  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!meta) return true;

  const content = meta.getAttribute('content') || '';
  const directivePattern = new RegExp(`${directive}\\s+([^;]+)`);
  const match = content.match(directivePattern);

  if (!match) return false;

  const sources = match[1].split(/\s+/);
  return sources.includes(source) || sources.includes('*');
}

/**
 * Generate nonce for inline scripts
 */
export function generateNonce(): string {
  return generateRandomToken(16);
}

/**
 * Validate webhook signature
 */
export async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

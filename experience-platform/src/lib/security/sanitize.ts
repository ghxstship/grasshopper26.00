/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .slice(0, 10000); // Limit length to prevent DoS
}

/**
 * Sanitize HTML content (basic - for production use DOMPurify)
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  // Remove any characters that aren't valid in email addresses
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, '')
    .slice(0, 254); // Max email length per RFC
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }

  // Keep only digits, +, -, (, ), and spaces
  return phone
    .trim()
    .replace(/[^0-9+\-() ]/g, '')
    .slice(0, 20);
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return '';
  }

  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[<>:"|?*]/g, '')
    .trim()
    .slice(0, 255);
}

/**
 * Sanitize SQL-like input (for search queries)
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  // Remove SQL injection attempts
  return query
    .trim()
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .slice(0, 500);
}

/**
 * Sanitize JSON input
 */
export function sanitizeJSON(input: any): any {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }

  if (typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeJSON);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize keys
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJSON(value);
      }
    }
    return sanitized;
  }

  return null;
}

/**
 * Sanitize object for database insertion
 */
export function sanitizeForDB(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Don't sanitize certain fields that need to preserve formatting
      if (key.includes('html') || key.includes('content') || key.includes('description')) {
        sanitized[key] = value.slice(0, 50000); // Just limit length
      } else if (key.includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.includes('url') || key.includes('link')) {
        sanitized[key] = sanitizeURL(value);
      } else if (key.includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeJSON(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize pagination parameters
 */
export function sanitizePagination(params: { limit?: any; offset?: any; page?: any }) {
  const limit = Math.min(Math.max(parseInt(String(params.limit || 20)), 1), 100);
  const offset = Math.max(parseInt(String(params.offset || 0)), 0);
  const page = Math.max(parseInt(String(params.page || 1)), 1);

  return { limit, offset, page };
}

/**
 * Sanitize sort parameters
 */
export function sanitizeSort(
  sortBy: string,
  sortOrder: string,
  allowedFields: string[]
): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const sanitizedSortBy = allowedFields.includes(sortBy) ? sortBy : allowedFields[0];
  const sanitizedSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) 
    ? sortOrder.toLowerCase() as 'asc' | 'desc'
    : 'asc';

  return { sortBy: sanitizedSortBy, sortOrder: sanitizedSortOrder };
}

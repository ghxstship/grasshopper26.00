/**
 * Form Validation Utilities
 * GHXSTSHIP Contemporary Minimal Pop Art Form System
 */

export interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone validation (US format)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length === 10;
}

/**
 * URL validation
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Required field validation
 */
export function validateRequired(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Min length validation
 */
export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Max length validation
 */
export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Pattern validation
 */
export function validatePattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Number range validation
 */
export function validateRange(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Date validation
 */
export function validateDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Credit card validation (Luhn algorithm)
 */
export function validateCreditCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters');
  
  if (password.length >= 12) score++;
  
  // Complexity checks
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
 * Validate multiple rules
 */
export function validateField(
  value: unknown,
  rules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: validateRequired,
    message,
  }),
  
  email: (message = 'Invalid email address'): ValidationRule => ({
    validate: (value) => typeof value === 'string' && validateEmail(value),
    message,
  }),
  
  phone: (message = 'Invalid phone number'): ValidationRule => ({
    validate: (value) => typeof value === 'string' && validatePhone(value),
    message,
  }),
  
  url: (message = 'Invalid URL'): ValidationRule => ({
    validate: (value) => typeof value === 'string' && validateUrl(value),
    message,
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'string' && validateMinLength(value, min),
    message: message || `Minimum length is ${min} characters`,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'string' && validateMaxLength(value, max),
    message: message || `Maximum length is ${max} characters`,
  }),
  
  pattern: (pattern: RegExp, message = 'Invalid format'): ValidationRule => ({
    validate: (value) => typeof value === 'string' && validatePattern(value, pattern),
    message,
  }),
  
  range: (min?: number, max?: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'number' && validateRange(value, min, max),
    message: message || `Value must be between ${min} and ${max}`,
  }),
  
  date: (message = 'Invalid date'): ValidationRule => ({
    validate: (value) => validateDate(value as string | Date),
    message,
  }),
  
  creditCard: (message = 'Invalid credit card number'): ValidationRule => ({
    validate: (value) => typeof value === 'string' && validateCreditCard(value),
    message,
  }),
  
  strongPassword: (message = 'Password is too weak'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      const strength = validatePasswordStrength(value);
      return strength.score >= 4;
    },
    message,
  }),
} as const;

/**
 * Sanitize input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Sanitize HTML
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
}

/**
 * Format credit card number for display
 */
export function formatCreditCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.match(/.{1,4}/g)?.join(' ') || digits;
}

/**
 * Validate form data
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, ValidationRule[]>
): Record<keyof T, ValidationResult> {
  const results = {} as Record<keyof T, ValidationResult>;
  
  for (const field in rules) {
    results[field] = validateField(data[field], rules[field]);
  }
  
  return results;
}

/**
 * Check if form is valid
 */
export function isFormValid<T extends Record<string, unknown>>(
  results: Record<keyof T, ValidationResult>
): boolean {
  return Object.values(results).every(result => result.isValid);
}

/**
 * Get first error message
 */
export function getFirstError<T extends Record<string, unknown>>(
  results: Record<keyof T, ValidationResult>
): string | null {
  for (const result of Object.values(results)) {
    if (!result.isValid && result.errors.length > 0) {
      return result.errors[0];
    }
  }
  return null;
}

/**
 * Debounce validation
 */
export function debounceValidation(
  fn: (...args: unknown[]) => void,
  delay: number = 300
): (...args: unknown[]) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Async validation
 */
export async function validateAsync(
  value: unknown,
  validator: (value: unknown) => Promise<boolean>,
  message: string
): Promise<ValidationResult> {
  try {
    const isValid = await validator(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Validation error occurred'],
    };
  }
}

/**
 * Error Helper Utilities
 * GHXSTSHIP Entertainment Platform Error Handling
 */

export class AppError extends Error {
  code: string;
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, code: string = 'APP_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message.toUpperCase();
  }

  if (error instanceof Error) {
    return error.message.toUpperCase();
  }

  return String(error).toUpperCase();
}

/**
 * Get error code
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Get error status code
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  return 500;
}

/**
 * Is operational error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }

  return false;
}

/**
 * Handle error
 */
export function handleError(error: unknown, context?: string): void {
  const message = formatErrorMessage(error);
  const code = getErrorCode(error);

  console.error(`[${code}]${context ? ` ${context}:` : ''} ${message}`);

  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}

/**
 * Create error response
 */
export function createErrorResponse(error: unknown): {
  error: {
    message: string;
    code: string;
    statusCode: number;
  };
} {
  return {
    error: {
      message: formatErrorMessage(error),
      code: getErrorCode(error),
      statusCode: getErrorStatusCode(error),
    },
  };
}

/**
 * Parse API error
 */
export function parseApiError(error: unknown): {
  message: string;
  code: string;
  details?: unknown;
} {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      message: String(err.message || 'An error occurred'),
      code: String(err.code || 'API_ERROR'),
      details: err.details,
    };
  }

  return {
    message: String(error),
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Retry with exponential backoff (error handling)
 */
export async function retryOnError<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  onRetry?: (attempt: number, error: unknown) => void
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        onRetry?.(attempt + 1, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Safe async function wrapper
 */
export function safeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, fn.name);
      return null;
    }
  };
}

/**
 * Try-catch wrapper
 */
export function tryCatch<T>(
  fn: () => T,
  fallback?: T
): T | undefined {
  try {
    return fn();
  } catch (error) {
    handleError(error);
    return fallback;
  }
}

/**
 * Async try-catch wrapper
 */
export async function tryAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error);
    return fallback;
  }
}

/**
 * Assert condition
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new AppError(message, 'ASSERTION_ERROR', 500);
  }
}

/**
 * Assert defined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = 'Value must be defined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new AppError(message, 'ASSERTION_ERROR', 500);
  }
}

/**
 * Create error boundary handler
 */
export function createErrorBoundaryHandler(
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
) {
  return {
    componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
      handleError(error, 'ErrorBoundary');
      onError?.(error, errorInfo);
    },
  };
}

/**
 * Format validation errors
 */
export function formatValidationErrors(
  errors: Record<string, string[]>
): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field.toUpperCase()}: ${messages.join(', ')}`)
    .join(' // ');
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof AuthenticationError) {
    return 'PLEASE LOG IN TO CONTINUE';
  }

  if (error instanceof AuthorizationError) {
    return 'YOU DO NOT HAVE PERMISSION TO ACCESS THIS';
  }

  if (error instanceof NotFoundError) {
    return error.message;
  }

  if (error instanceof RateLimitError) {
    return 'TOO MANY REQUESTS. PLEASE TRY AGAIN LATER';
  }

  if (error instanceof NetworkError) {
    return 'NETWORK ERROR. PLEASE CHECK YOUR CONNECTION';
  }

  return 'AN ERROR OCCURRED. PLEASE TRY AGAIN';
}

/**
 * Log error to service
 */
export function logErrorToService(
  error: unknown,
  context?: Record<string, unknown>
): void {
  // Placeholder - integrate with error tracking service (Sentry, etc.)
  console.error('Error logged:', {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create error with context
 */
export function createErrorWithContext(
  error: unknown,
  context: Record<string, unknown>
): AppError {
  const message = error instanceof Error ? error.message : String(error);
  const appError = new AppError(message);
  
  Object.assign(appError, { context });
  
  return appError;
}

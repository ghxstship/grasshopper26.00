import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Standard error response structure
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
}

// Error codes enum
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Business Logic
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ORDER_ALREADY_PROCESSED = 'ORDER_ALREADY_PROCESSED',
  EVENT_SOLD_OUT = 'EVENT_SOLD_OUT',
  TICKET_LIMIT_EXCEEDED = 'TICKET_LIMIT_EXCEEDED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // File Upload
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

// Custom error class
export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Error handler function
export function handleAPIError(
  error: unknown,
  path?: string
): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
          path,
        },
      },
      { status: 400 }
    );
  }

  // Handle custom API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          path,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message;

    return NextResponse.json(
      {
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message,
          timestamp: new Date().toISOString(),
          path,
        },
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        path,
      },
    },
    { status: 500 }
  );
}

// Success response helper
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}

// Pagination response helper
export function paginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): NextResponse {
  return NextResponse.json({
    data,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      timestamp: new Date().toISOString(),
    },
  });
}

// Common error responses
export const ErrorResponses = {
  unauthorized: () =>
    new APIError(
      ErrorCode.UNAUTHORIZED,
      'Authentication required',
      401
    ),

  forbidden: (message: string = 'Access denied') =>
    new APIError(ErrorCode.FORBIDDEN, message, 403),

  badRequest: (message: string, details?: any) =>
    new APIError(ErrorCode.INVALID_INPUT, message, 400, details),

  notFound: (resource: string = 'Resource') =>
    new APIError(
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      404
    ),

  alreadyExists: (resource: string) =>
    new APIError(
      ErrorCode.ALREADY_EXISTS,
      `${resource} already exists`,
      409
    ),

  conflict: (message: string) =>
    new APIError(ErrorCode.CONFLICT, message, 409),

  validationError: (message: string, details?: any) =>
    new APIError(
      ErrorCode.VALIDATION_ERROR,
      message,
      400,
      details
    ),

  insufficientInventory: (available: number) =>
    new APIError(
      ErrorCode.INSUFFICIENT_INVENTORY,
      `Insufficient inventory. Only ${available} available.`,
      400,
      { available }
    ),

  eventSoldOut: () =>
    new APIError(
      ErrorCode.EVENT_SOLD_OUT,
      'This event is sold out',
      400
    ),

  ticketLimitExceeded: (limit: number) =>
    new APIError(
      ErrorCode.TICKET_LIMIT_EXCEEDED,
      `Maximum ${limit} tickets per order`,
      400,
      { limit }
    ),

  rateLimitExceeded: (retryAfter: number) =>
    new APIError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded. Please try again later.',
      429,
      { retryAfter }
    ),

  databaseError: (message: string, details?: any) =>
    new APIError(
      ErrorCode.DATABASE_ERROR,
      message,
      500,
      details
    ),

  paymentFailed: (message: string) =>
    new APIError(
      ErrorCode.PAYMENT_FAILED,
      message,
      402
    ),

  fileTooLarge: (maxSize: number) =>
    new APIError(
      ErrorCode.FILE_TOO_LARGE,
      `File size exceeds maximum of ${maxSize} bytes`,
      413,
      { maxSize }
    ),

  invalidFileType: (allowedTypes: string[]) =>
    new APIError(
      ErrorCode.INVALID_FILE_TYPE,
      'Invalid file type',
      400,
      { allowedTypes }
    ),

  externalServiceError: (service: string) =>
    new APIError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `${service} service is unavailable`,
      503
    ),
};

// Async error wrapper for route handlers
export function asyncHandler<T = any>(
  handler: (req: Request, context?: any) => Promise<NextResponse<T>>
) {
  return async (req: Request, context?: any): Promise<NextResponse<T>> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleAPIError(error, req.url) as NextResponse<T>;
    }
  };
}

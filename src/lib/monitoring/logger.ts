/**
 * Centralized logging utility
 * Supports multiple log levels and structured logging
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = process.env.LOG_LEVEL || LogLevel.INFO;

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.logLevel as LogLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    // In production, send to external logging service
    if (!this.isDevelopment) {
      this.sendToExternalService(level, message, context);
    }

    // Console output
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage);
        break;
    }
  }

  private async sendToExternalService(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    // TODO: Integrate with Sentry, CloudWatch, or other logging service
    // Example: Sentry integration
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      // Sentry.captureException(new Error(message), { extra: context });
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: error?.stack,
    };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: error?.stack,
    };
    this.log(LogLevel.FATAL, message, errorContext);
  }

  // API request logging
  logRequest(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info('API Request', {
      method,
      path,
      statusCode,
      duration,
      ...context,
    });
  }

  // Database query logging
  logQuery(query: string, duration: number, context?: LogContext): void {
    this.debug('Database Query', {
      query,
      duration,
      ...context,
    });
  }

  // Security event logging
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level = severity === 'critical' || severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;
    this.log(level, `Security Event: ${event}`, {
      severity,
      ...context,
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, `Performance: ${operation}`, {
      duration,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Request logging middleware helper
export function createRequestLogger(req: Request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  return {
    requestId,
    log: (message: string, context?: LogContext) => {
      logger.info(message, {
        requestId,
        path: new URL(req.url).pathname,
        method: req.method,
        ...context,
      });
    },
    logEnd: (statusCode: number) => {
      const duration = Date.now() - startTime;
      logger.logRequest(
        req.method,
        new URL(req.url).pathname,
        statusCode,
        duration,
        { requestId }
      );
    },
  };
}

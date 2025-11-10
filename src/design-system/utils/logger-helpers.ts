/**
 * Logger Helper Utilities
 * GHXSTSHIP Entertainment Platform Logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

/**
 * Logger class
 */
export class Logger {
  private name: string;
  private minLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor(name: string, minLevel: LogLevel = 'info') {
    this.name = name;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}`;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      stack: new Error().stack,
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;

    const formatted = this.formatMessage('debug', message);
    console.debug(formatted, context);

    this.addLog(this.createLogEntry('debug', message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;

    const formatted = this.formatMessage('info', message);
    console.info(formatted, context);

    this.addLog(this.createLogEntry('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;

    const formatted = this.formatMessage('warn', message);
    console.warn(formatted, context);

    this.addLog(this.createLogEntry('warn', message, context));
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;

    const formatted = this.formatMessage('error', message);
    console.error(formatted, error, context);

    const entry = this.createLogEntry('error', message, {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });

    this.addLog(entry);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

/**
 * Create logger instance
 */
export function createLogger(name: string, minLevel?: LogLevel): Logger {
  return new Logger(name, minLevel);
}

/**
 * Global logger
 */
export const logger = createLogger('GVTEWAY');

/**
 * Log performance metric
 */
export function logPerformance(name: string, duration: number): void {
  logger.info(`Performance: ${name}`, { duration: `${duration}ms` });
}

/**
 * Log API request
 */
export function logApiRequest(
  method: string,
  url: string,
  status?: number,
  duration?: number
): void {
  logger.info(`API ${method} ${url}`, {
    status,
    duration: duration ? `${duration}ms` : undefined,
  });
}

/**
 * Log user action
 */
export function logUserAction(action: string, details?: Record<string, unknown>): void {
  logger.info(`User action: ${action}`, details);
}

/**
 * Log error with context
 */
export function logError(message: string, error: unknown, context?: Record<string, unknown>): void {
  logger.error(message, error, context);
}

/**
 * Create performance logger
 */
export function createPerformanceLogger(name: string) {
  const startTime = performance.now();

  return {
    end: () => {
      const duration = performance.now() - startTime;
      logPerformance(name, duration);
      return duration;
    },
  };
}

/**
 * Log with timestamp
 */
export function logWithTimestamp(message: string, level: LogLevel = 'info'): void {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${message}`;

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

/**
 * Create structured log
 */
export function createStructuredLog(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): string {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Log to console in development
 */
export function devLog(message: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] ${message}`, ...args);
  }
}

/**
 * Group logs
 */
export function groupLogs(label: string, fn: () => void): void {
  console.group(label);
  fn();
  console.groupEnd();
}

/**
 * Table log
 */
export function tableLog(data: Record<string, unknown>[] | Record<string, unknown>): void {
  console.table(data);
}

/**
 * Assert log
 */
export function assertLog(condition: boolean, message: string): void {
  console.assert(condition, message);
}

/**
 * Count log
 */
export function countLog(label: string): void {
  console.count(label);
}

/**
 * Time log
 */
export function timeLog(label: string): void {
  console.time(label);
}

/**
 * Time end log
 */
export function timeEndLog(label: string): void {
  console.timeEnd(label);
}

/**
 * Trace log
 */
export function traceLog(message?: string): void {
  console.trace(message);
}

/**
 * Clear console
 */
export function clearConsole(): void {
  console.clear();
}

/**
 * Format log for GHXSTSHIP style
 */
export function formatGHXSTSHIPLog(message: string, level: LogLevel = 'info'): string {
  const symbols = {
    debug: '◆',
    info: '■',
    warn: '▲',
    error: '✕',
  };

  return `${symbols[level]} ${message.toUpperCase()}`;
}

/**
 * Log with GHXSTSHIP formatting
 */
export function ghxstshipLog(message: string, level: LogLevel = 'info'): void {
  const formatted = formatGHXSTSHIPLog(message, level);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

/**
 * Create request logger
 */
export function createRequestLogger() {
  const requests = new Map<string, number>();

  return {
    start: (id: string) => {
      requests.set(id, Date.now());
    },

    end: (id: string, status?: number) => {
      const startTime = requests.get(id);
      if (startTime) {
        const duration = Date.now() - startTime;
        logger.info(`Request ${id} completed`, { status, duration: `${duration}ms` });
        requests.delete(id);
      }
    },

    clear: () => {
      requests.clear();
    },
  };
}

/**
 * Batch logger
 */
export class BatchLogger {
  private batch: LogEntry[] = [];
  private batchSize: number;
  private flushInterval: number;
  private intervalId?: NodeJS.Timeout;

  constructor(batchSize: number = 10, flushInterval: number = 5000) {
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.startAutoFlush();
  }

  log(entry: LogEntry): void {
    this.batch.push(entry);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.batch.length === 0) return;

    // Send batch to logging service
    console.log('Flushing batch:', this.batch);

    this.batch = [];
  }

  private startAutoFlush(): void {
    this.intervalId = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.flush();
  }
}

/**
 * Security Monitoring and Alerting System
 * 
 * Monitors security events and triggers alerts for suspicious activity
 */

import { logger } from '@/lib/monitoring/logger';

export enum SecurityEventType {
  // Authentication
  LOGIN_FAILED = 'login_failed',
  LOGIN_SUCCESS = 'login_success',
  ACCOUNT_LOCKED = 'account_locked',
  PASSWORD_RESET = 'password_reset',
  MFA_FAILED = 'mfa_failed',
  
  // Authorization
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  IDOR_ATTEMPT = 'idor_attempt',
  
  // API Security
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_TOKEN = 'invalid_token',
  CSRF_VIOLATION = 'csrf_violation',
  
  // Data Security
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_EXPORT = 'data_export',
  DATA_DELETION = 'data_deletion',
  
  // Application Security
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  FILE_UPLOAD_VIOLATION = 'file_upload_violation',
  
  // Infrastructure
  SUSPICIOUS_TRAFFIC = 'suspicious_traffic',
  DDOS_DETECTED = 'ddos_detected',
  IP_BLOCKED = 'ip_blocked',
  
  // Business Logic
  PAYMENT_ANOMALY = 'payment_anomaly',
  REFUND_ABUSE = 'refund_abuse',
  CREDIT_MANIPULATION = 'credit_manipulation',
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Event thresholds for alerting
const ALERT_THRESHOLDS: Partial<Record<SecurityEventType, {
  count: number;
  window: number;
  severity: SecuritySeverity;
}>> = {
  [SecurityEventType.LOGIN_FAILED]: {
    count: 5,
    window: 15 * 60 * 1000, // 15 minutes
    severity: SecuritySeverity.MEDIUM,
  },
  [SecurityEventType.UNAUTHORIZED_ACCESS]: {
    count: 3,
    window: 5 * 60 * 1000, // 5 minutes
    severity: SecuritySeverity.HIGH,
  },
  [SecurityEventType.RATE_LIMIT_EXCEEDED]: {
    count: 10,
    window: 60 * 60 * 1000, // 1 hour
    severity: SecuritySeverity.MEDIUM,
  },
  [SecurityEventType.SQL_INJECTION_ATTEMPT]: {
    count: 1,
    window: 60 * 1000, // 1 minute
    severity: SecuritySeverity.CRITICAL,
  },
  [SecurityEventType.PAYMENT_ANOMALY]: {
    count: 1,
    window: 60 * 1000, // 1 minute
    severity: SecuritySeverity.CRITICAL,
  },
};

// In-memory event store (use Redis in production)
const eventStore = new Map<string, SecurityEvent[]>();

class SecurityMonitor {
  private static instance: SecurityMonitor;

  private constructor() {
    // Initialize monitoring
    this.startCleanupInterval();
  }

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  /**
   * Log a security event
   */
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Store event
    const key = this.getEventKey(event.type, event.userId || event.ip || 'unknown');
    const events = eventStore.get(key) || [];
    events.push(fullEvent);
    eventStore.set(key, events);

    // Log to monitoring system
    logger.logSecurityEvent(
      event.type,
      event.severity,
      {
        userId: event.userId,
        ip: event.ip,
        path: event.path,
        ...event.details,
      }
    );

    // Check if alert threshold is met
    this.checkAlertThreshold(event.type, key);
  }

  /**
   * Check if alert threshold is exceeded
   */
  private checkAlertThreshold(type: SecurityEventType, key: string): void {
    const threshold = ALERT_THRESHOLDS[type];
    if (!threshold) return;

    const events = eventStore.get(key) || [];
    const now = Date.now();
    const recentEvents = events.filter(
      (e) => now - e.timestamp.getTime() < threshold.window
    );

    if (recentEvents.length >= threshold.count) {
      this.triggerAlert({
        type,
        severity: threshold.severity,
        count: recentEvents.length,
        window: threshold.window,
        events: recentEvents,
      });
    }
  }

  /**
   * Trigger security alert
   */
  private triggerAlert(alert: {
    type: SecurityEventType;
    severity: SecuritySeverity;
    count: number;
    window: number;
    events: SecurityEvent[];
  }): void {
    logger.error(
      `Security Alert: ${alert.type}`,
      undefined,
      {
        severity: alert.severity,
        count: alert.count,
        window: alert.window,
        firstEvent: alert.events[0],
        lastEvent: alert.events[alert.events.length - 1],
      }
    );

    // In production, send to alerting system (PagerDuty, Slack, etc.)
    this.sendAlert(alert);
  }

  /**
   * Send alert to external system
   */
  private async sendAlert(alert: {
    type: SecurityEventType;
    severity: SecuritySeverity;
    count: number;
    window: number;
    events: SecurityEvent[];
  }): Promise<void> {
    // TODO: Integrate with alerting system
    // Examples:
    // - Send to Slack webhook
    // - Send to PagerDuty
    // - Send email to security team
    // - Create incident in ticketing system

    if (process.env.NODE_ENV === 'production') {
      // Example: Slack webhook
      // await fetch(process.env.SLACK_SECURITY_WEBHOOK!, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     text: `🚨 Security Alert: ${alert.type}`,
      //     attachments: [{
      //       color: alert.severity === SecuritySeverity.CRITICAL ? 'danger' : 'warning',
      //       fields: [
      //         { title: 'Severity', value: alert.severity, short: true },
      //         { title: 'Count', value: alert.count.toString(), short: true },
      //         { title: 'Time Window', value: `${alert.window / 1000}s`, short: true },
      //       ],
      //     }],
      //   }),
      // });
    }
  }

  /**
   * Get event key for grouping
   */
  private getEventKey(type: SecurityEventType, identifier: string): string {
    return `${type}:${identifier}`;
  }

  /**
   * Get recent events
   */
  getRecentEvents(
    type?: SecurityEventType,
    limit = 100
  ): SecurityEvent[] {
    const allEvents: SecurityEvent[] = [];

    for (const [key, events] of eventStore.entries()) {
      if (!type || key.startsWith(type)) {
        allEvents.push(...events);
      }
    }

    return allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get events for specific user or IP
   */
  getEventsForIdentifier(
    identifier: string,
    limit = 100
  ): SecurityEvent[] {
    const events: SecurityEvent[] = [];

    for (const [_, eventList] of eventStore.entries()) {
      events.push(
        ...eventList.filter(
          (e) => e.userId === identifier || e.ip === identifier
        )
      );
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get security statistics
   */
  getStatistics(timeWindow = 24 * 60 * 60 * 1000): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
    topIPs: Array<{ ip: string; count: number }>;
  } {
    const now = Date.now();
    const cutoff = now - timeWindow;
    const allEvents: SecurityEvent[] = [];

    for (const events of eventStore.values()) {
      allEvents.push(
        ...events.filter((e) => e.timestamp.getTime() > cutoff)
      );
    }

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const userCounts = new Map<string, number>();
    const ipCounts = new Map<string, number>();

    for (const event of allEvents) {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Count by severity
      eventsBySeverity[event.severity] =
        (eventsBySeverity[event.severity] || 0) + 1;

      // Count by user
      if (event.userId) {
        userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
      }

      // Count by IP
      if (event.ip) {
        ipCounts.set(event.ip, (ipCounts.get(event.ip) || 0) + 1);
      }
    }

    const topUsers = Array.from(userCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    const topIPs = Array.from(ipCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    return {
      totalEvents: allEvents.length,
      eventsByType,
      eventsBySeverity,
      topUsers,
      topIPs,
    };
  }

  /**
   * Clean up old events
   */
  private startCleanupInterval(): void {
    // Clean up events older than 7 days every hour
    setInterval(() => {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

      for (const [key, events] of eventStore.entries()) {
        const filtered = events.filter(
          (e) => e.timestamp.getTime() > cutoff
        );

        if (filtered.length === 0) {
          eventStore.delete(key);
        } else {
          eventStore.set(key, filtered);
        }
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Clear all events (for testing)
   */
  clearEvents(): void {
    eventStore.clear();
  }
}

// Export singleton
export const securityMonitor = SecurityMonitor.getInstance();

// Convenience functions
export function logSecurityEvent(
  event: Omit<SecurityEvent, 'timestamp'>
): void {
  securityMonitor.logEvent(event);
}

export function getSecurityStats(timeWindow?: number) {
  return securityMonitor.getStatistics(timeWindow);
}

export function getRecentSecurityEvents(type?: SecurityEventType, limit?: number) {
  return securityMonitor.getRecentEvents(type, limit);
}

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './error-boundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={styles.container}>
          <Card className={styles.card}>
            <CardHeader>
              <div className={styles.header}>
                <AlertTriangle className={styles.icon} />
                <CardTitle className={styles.title}>
                  Something went wrong
                </CardTitle>
              </div>
              <CardDescription className={styles.description}>
                We apologize for the inconvenience. An unexpected error has occurred.
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.content}>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className={styles.errorDetails}>
                  <p className={styles.errorText}>
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className={styles.stackTrace}>
                      <summary className={styles.stackSummary}>
                        Stack trace
                      </summary>
                      <pre className={styles.stackPre}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className={styles.actions}>
                <Button
                  onClick={this.handleReset}
                  className={styles.actionButton}
                  variant="default"
                >
                  <RefreshCw className={styles.buttonIcon} />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className={styles.actionButton}
                  variant="outline"
                >
                  <Home className={styles.buttonIcon} />
                  Go Home
                </Button>
              </div>

              <p className={styles.supportText}>
                If this problem persists, please contact support at{' '}
                <a
                  href="mailto:support@grasshopper.com"
                  className={styles.supportLink}
                >
                  support@grasshopper.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

/**
 * Async error boundary wrapper
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

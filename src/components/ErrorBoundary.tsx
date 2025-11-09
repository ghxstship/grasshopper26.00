'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8">
          <div className="max-w-md text-center">
            <GeometricIcon name="alert" size="xl" className="mb-6 text-grey-400" />
            
            <h1 className="font-anton text-3xl uppercase">SOMETHING WENT WRONG</h1>
            
            <p className="mt-4 font-share-tech text-grey-700">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="mt-6 border-3 border-black bg-grey-50 p-4 text-left">
                <p className="font-share-tech-mono text-xs text-grey-600">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 border-3 border-black bg-black px-6 py-3 font-bebas-neue uppercase text-white transition-colors hover:bg-white hover:text-black"
            >
              RELOAD PAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

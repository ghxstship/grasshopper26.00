/**
 * Next.js Instrumentation
 * This file is automatically loaded by Next.js and runs before the application starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    await import('./instrumentation-server');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    await import('./instrumentation-edge');
  }
}

// Client-side instrumentation is handled separately in _app.tsx or layout.tsx

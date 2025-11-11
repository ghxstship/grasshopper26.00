/**
 * Toaster Component
 * GHXSTSHIP Entertainment Platform - Toast notification container
 * Atomic Design: Atom (wraps Sonner library)
 */

'use client';

import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          border: 'var(--border-width-thick) solid var(--color-border-strong)',
          borderRadius: '0',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-base)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-4)',
        },
        className: 'ghxstship-toast',
      }}
      visibleToasts={5}
      closeButton
      richColors
      expand={false}
      gap={16}
      duration={5000}
    />
  );
};

Toaster.displayName = 'Toaster';

'use client';

import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--color-background)',
          color: 'var(--color-text)',
          border: 'var(--border-width) solid var(--color-border)',
          fontFamily: 'var(--font-body)',
        },
      }}
    />
  );
};

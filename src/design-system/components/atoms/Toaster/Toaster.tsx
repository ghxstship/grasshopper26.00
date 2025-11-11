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
          border: '3px solid var(--color-border)',
          borderRadius: '0',
          fontFamily: 'var(--font-body)',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.5)',
        },
        className: 'ghxstship-toast',
      }}
      visibleToasts={5}
      closeButton
      richColors
      expand={false}
      gap={12}
    />
  );
};

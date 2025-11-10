/**
 * AuthCardTemplate
 * GHXSTSHIP Monochromatic Design System
 * Template for authentication card layouts
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './AuthCardTemplate.module.css';

export interface AuthCardTemplateProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitLoading?: boolean;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
  className?: string;
}

export const AuthCardTemplate: React.FC<AuthCardTemplateProps> = ({
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Submit',
  submitLoading = false,
  footerText,
  footerLink,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Typography variant="h2" as="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="body" as="p" className={styles.description}>
              {description}
            </Typography>
          )}
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          {children}
          
          {onSubmit && (
            <Button
              type="submit"
              variant="filled"
              fullWidth
              disabled={submitLoading}
              className={styles.submitButton}
            >
              {submitLabel}
            </Button>
          )}
        </form>

        {(footerText || footerLink) && (
          <div className={styles.footer}>
            {footerText && (
              <Typography variant="meta" as="span">
                {footerText}
              </Typography>
            )}
            {footerLink && (
              <Link href={footerLink.href} className={styles.footerLink}>
                {footerLink.text}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

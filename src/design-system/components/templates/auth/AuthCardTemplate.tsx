/**
 * Auth Card Template
 * Standardized layout for all authentication pages
 * Enforces design system compliance and consistent UX
 */

'use client';

import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import styles from './AuthCardTemplate.module.css';

export interface AuthCardTemplateProps {
  // Card Header
  title: string;
  description?: string;
  
  // Form
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitLoading?: boolean;
  children: React.ReactNode; // Form fields
  
  // OAuth (optional)
  showOAuth?: boolean;
  oauthProviders?: Array<'google' | 'github' | 'azure'>;
  onOAuthLogin?: (provider: 'google' | 'github' | 'azure') => void;
  
  // Magic Link (optional)
  showMagicLink?: boolean;
  onMagicLink?: () => void;
  magicLinkLoading?: boolean;
  
  // Footer
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

const OAuthIcons = {
  google: (
    <svg className={styles.oauthIcon} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
  github: (
    <svg className={styles.oauthIcon} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  azure: (
    <svg className={styles.oauthIcon} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.05 4.24L6.25 5.58l-.01 10.56 6.81 3.62 7.95-1.32V6.56l-7.95-2.32zm-.01 1.73l5.98 1.75v8.56l-5.98.99V5.97zm-5.98 1.14l5.01-.96v10.3l-5.01-2.66V7.11z"/>
    </svg>
  ),
};

export function AuthCardTemplate({
  title,
  description,
  onSubmit,
  submitLabel = 'Submit',
  submitLoading = false,
  children,
  showOAuth = false,
  oauthProviders = ['google', 'github', 'azure'],
  onOAuthLogin,
  showMagicLink = false,
  onMagicLink,
  magicLinkLoading = false,
  footerText,
  footerLink,
}: AuthCardTemplateProps) {
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader className={styles.header}>
          <CardTitle className={styles.title}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={styles.description}>
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className={styles.content}>
          {/* Main Form */}
          {onSubmit && (
            <form onSubmit={onSubmit} className={styles.form}>
              <div className={styles.formFields}>
                {children}
              </div>
              <Button
                type="submit"
                className={styles.submitButton}
                disabled={submitLoading}
              >
                {submitLoading && <Loader2 className={styles.spinner} />}
                {submitLabel}
              </Button>
            </form>
          )}

          {/* No form, just children */}
          {!onSubmit && children}

          {/* OAuth Section */}
          {showOAuth && onOAuthLogin && (
            <>
              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>Or continue with</span>
                <div className={styles.dividerLine} />
              </div>

              <div className={styles.oauthGrid}>
                {oauthProviders.map((provider) => (
                  <Button
                    key={provider}
                    type="button"
                    variant="outline"
                    onClick={() => onOAuthLogin(provider)}
                    className={styles.oauthButton}
                  >
                    {OAuthIcons[provider]}
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </Button>
                ))}
                
                {/* Magic Link Button */}
                {showMagicLink && onMagicLink && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onMagicLink}
                    disabled={magicLinkLoading}
                    className={styles.oauthButton}
                  >
                    {magicLinkLoading && <Loader2 className={styles.spinner} />}
                    Magic Link
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>

        {/* Footer */}
        {(footerText || footerLink) && (
          <CardFooter className={styles.footer}>
            <p className={styles.footerText}>
              {footerText}{' '}
              {footerLink && (
                <Link href={footerLink.href} className={styles.footerLink}>
                  {footerLink.text}
                </Link>
              )}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

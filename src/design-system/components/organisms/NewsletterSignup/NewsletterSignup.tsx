/**
 * NewsletterSignup Component
 * Entertainment Platform - Bold geometric input fields with thick borders
 */

import * as React from 'react';
import styles from './NewsletterSignup.module.css';

export interface NewsletterSignupProps {
  onSubmit?: (email: string) => void | Promise<void>;
  variant?: 'black' | 'white';
  className?: string;
}

export const NewsletterSignup = React.forwardRef<HTMLDivElement, NewsletterSignupProps>(
  ({ onSubmit, variant = 'white', className = '' }, ref) => {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('PLEASE ENTER A VALID EMAIL');
        return;
      }

      setLoading(true);
      setError('');

      try {
        if (onSubmit) {
          await onSubmit(email);
        }
        setSuccess(true);
        setEmail('');
        setTimeout(() => setSuccess(false), 5000);
      } catch (err) {
        setError('SOMETHING WENT WRONG. TRY AGAIN.');
      } finally {
        setLoading(false);
      }
    };

    const classNames = [
      styles.newsletter,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        <div className={styles.content}>
          <h3 className={styles.title}>
            STAY IN THE LOOP
          </h3>
          <p className={styles.description}>
            GET EXCLUSIVE ACCESS TO PRESALES, LINEUP ANNOUNCEMENTS & MORE
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL ADDRESS"
                className={styles.input}
                disabled={loading || success}
                aria-label="Email address"
                aria-invalid={!!error}
                aria-describedby={error ? 'newsletter-error' : undefined}
              />
              <button
                type="submit"
                className={styles.button}
                disabled={loading || success}
                aria-label="Subscribe to newsletter"
              >
                {loading ? 'SENDING...' : success ? 'SUBSCRIBED!' : 'SUBSCRIBE'}
              </button>
            </div>

            {error && (
              <p id="newsletter-error" className={styles.error} role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className={styles.success} role="status">
                ✓ YOU&apos;RE ON THE LIST!
              </p>
            )}
          </form>

          <p className={styles.privacy}>
            WE RESPECT YOUR PRIVACY. UNSUBSCRIBE ANYTIME.
          </p>
        </div>
      </div>
    );
  }
);

NewsletterSignup.displayName = 'NewsletterSignup';

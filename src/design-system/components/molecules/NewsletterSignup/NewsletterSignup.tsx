'use client';

import * as React from 'react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import styles from './NewsletterSignup.module.css';

export interface NewsletterSignupProps {
  className?: string;
}

/**
 * NewsletterSignup - Newsletter subscription form
 * Atomic design molecule using Input and Button atoms
 */
export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ className = '' }) => {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Newsletter signup logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        <h2 className={styles.heading}>STAY IN THE LOOP</h2>
        <p className={styles.description}>
          Get exclusive access to presales, new events, and artist announcements.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="YOUR EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            aria-label="Email address for newsletter"
          />
          <Button
            type="submit"
            variant="filled"
            size="lg"
            disabled={isSubmitting}
            className={styles.button}
            aria-label="Subscribe to newsletter"
          >
            SUBSCRIBE
          </Button>
        </form>
        <p className={styles.privacy}>
          WE RESPECT YOUR PRIVACY. UNSUBSCRIBE ANYTIME.
        </p>
      </div>
    </div>
  );
};

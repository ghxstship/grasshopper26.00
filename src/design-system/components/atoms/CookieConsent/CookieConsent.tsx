/**
 * CookieConsent Component
 * GHXSTSHIP Entertainment Platform - Cookie consent banner
 * Atomic Design: Atom
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './CookieConsent.module.css';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div 
      className={styles.banner}
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
    >
      <div className={styles.content}>
        <p id="cookie-consent-description" className={styles.text}>
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <div className={styles.actions}>
          <button 
            onClick={acceptCookies} 
            className={styles.button}
            aria-label="Accept cookies"
          >
            Accept
          </button>
          <button 
            onClick={declineCookies} 
            className={`${styles.button} ${styles.buttonSecondary}`}
            aria-label="Decline cookies"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

CookieConsent.displayName = 'CookieConsent';

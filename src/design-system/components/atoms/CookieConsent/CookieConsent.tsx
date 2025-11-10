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

  if (!showConsent) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <p className={styles.text}>
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <button onClick={acceptCookies} className={styles.button}>
          Accept
        </button>
      </div>
    </div>
  );
};

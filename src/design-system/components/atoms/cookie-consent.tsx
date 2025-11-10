/**
 * Cookie Consent Banner
 * GDPR-compliant cookie consent
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './cookie-consent.module.css';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className={styles.card}>
      <div className={styles.container}>
        <div className={styles.row}>
          {/* Message */}
          <div className={styles.container}>
            <p className={styles.text}>
              WE USE COOKIES
            </p>
            <p className={styles.text}>
              We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. 
              {' '}
              <Link href="/legal/privacy" className="underline hover:no-underline">
                Learn more in our Privacy Policy
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className={styles.card}>
            <button
              onClick={declineCookies}
              className={styles.card}
            >
              DECLINE
            </button>
            <button
              onClick={acceptCookies}
              className={styles.card}
            >
              ACCEPT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

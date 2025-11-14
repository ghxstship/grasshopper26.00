/**
 * CookieConsent - Cookie consent banner atom
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState, useEffect } from 'react';
import { Button, Text } from '../';
import styles from './CookieConsent.module.css';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <Text size="sm">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </Text>
        <Button variant="primary" size="sm" onClick={handleAccept}>
          Accept
        </Button>
      </div>
    </div>
  );
}

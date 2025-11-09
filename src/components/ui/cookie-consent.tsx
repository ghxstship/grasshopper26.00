/**
 * Cookie Consent Banner
 * GDPR-compliant cookie consent
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-3 border-black bg-white shadow-geometric-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Message */}
          <div className="flex-1">
            <p className="font-bebas text-h6 uppercase mb-2">
              WE USE COOKIES
            </p>
            <p className="font-share text-body text-grey-700">
              We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. 
              {' '}
              <Link href="/legal/privacy" className="underline hover:no-underline">
                Learn more in our Privacy Policy
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={declineCookies}
              className="px-6 py-3 border-3 border-black bg-white text-black hover:bg-grey-100 font-bebas text-body uppercase transition-colors"
            >
              DECLINE
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-3 border-3 border-black bg-black text-white hover:bg-grey-900 font-bebas text-body uppercase transition-colors"
            >
              ACCEPT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * GDPR/CCPA Compliant Cookie Consent Banner
 * Provides granular control over cookie categories
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const STORAGE_KEY = 'cookie-preferences';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,  // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });
  
  useEffect(() => {
    // Check if user has already made a choice
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (!savedPreferences) {
      setIsVisible(true);
    }
  }, []);
  
  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
    setIsVisible(false);
  };
  
  const handleAcceptSelected = () => {
    savePreferences(preferences);
    setIsVisible(false);
  };
  
  const handleRejectAll = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    savePreferences(necessaryOnly);
    setIsVisible(false);
  };
  
  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    
    // Dispatch event for other parts of app to react
    window.dispatchEvent(new CustomEvent('cookie-preferences-updated', { 
      detail: prefs 
    }));
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed inset-x-0 bottom-0 z-[var(--z-notification)] p-4 md:p-6"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-description"
    >
      <div className="mx-auto max-w-4xl rounded-lg bg-[var(--color-bg-raised)] border border-[var(--color-border-default)] shadow-[var(--shadow-xl)] backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Cookie Preferences
            </h2>
            <button
              onClick={() => setIsVisible(false)}
              aria-label="Close cookie banner"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p id="cookie-description" className="text-[var(--color-text-secondary)] mb-4">
            We use cookies to enhance your experience, analyze site traffic, and 
            personalize content. You can customize your preferences below.
          </p>
          
          {showDetails && (
            <div className="space-y-4 mb-6">
              <CookieCategory
                title="Necessary Cookies"
                description="Essential for the website to function. Cannot be disabled."
                checked={preferences.necessary}
                disabled={true}
                onChange={() => {}}
              />
              
              <CookieCategory
                title="Analytics Cookies"
                description="Help us understand how visitors use our website."
                checked={preferences.analytics}
                onChange={(checked) => 
                  setPreferences({ ...preferences, analytics: checked })
                }
              />
              
              <CookieCategory
                title="Marketing Cookies"
                description="Used to deliver personalized advertisements."
                checked={preferences.marketing}
                onChange={(checked) => 
                  setPreferences({ ...preferences, marketing: checked })
                }
              />
              
              <CookieCategory
                title="Preference Cookies"
                description="Remember your settings and preferences."
                checked={preferences.preferences}
                onChange={(checked) => 
                  setPreferences({ ...preferences, preferences: checked })
                }
              />
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleAcceptAll}
              size="lg"
            >
              Accept All
            </Button>
            
            <Button 
              onClick={handleRejectAll}
              variant="outline"
              size="lg"
            >
              Reject All
            </Button>
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              size="lg"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            
            {showDetails && (
              <Button 
                onClick={handleAcceptSelected}
                variant="secondary"
                size="lg"
              >
                Save Preferences
              </Button>
            )}
          </div>
          
          <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">
            <a 
              href="/privacy" 
              className="underline hover:text-[var(--color-text-secondary)]"
            >
              Privacy Policy
            </a>
            {' • '}
            <a 
              href="/cookies" 
              className="underline hover:text-[var(--color-text-secondary)]"
            >
              Cookie Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

interface CookieCategoryProps {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function CookieCategory({ 
  title, 
  description, 
  checked, 
  disabled = false,
  onChange 
}: CookieCategoryProps) {
  return (
    <label className="flex items-start gap-3 p-4 rounded-md bg-[var(--color-bg-secondary)] cursor-pointer hover:bg-[var(--color-bg-tertiary)] transition-colors">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-[var(--color-border-default)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2"
        aria-label={`${title} ${disabled ? '(required)' : ''}`}
      />
      <div className="flex-1">
        <div className="font-medium text-[var(--color-text-primary)]">
          {title}
          {disabled && (
            <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">
              (Required)
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {description}
        </p>
      </div>
    </label>
  );
}

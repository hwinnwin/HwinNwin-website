import { useState, useEffect, useCallback } from 'react';
import { CookieConsent, DEFAULT_CONSENT, CONSENT_STORAGE_KEY, CONSENT_VERSION, CookieCategory } from '@/types/cookies';

export interface CookieConsentHook {
  consent: CookieConsent | null;
  hasConsented: boolean;
  updateConsent: (newConsent: Partial<CookieConsent>) => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  resetConsent: () => void;
  isAllowed: (category: CookieCategory) => boolean;
}

export function useCookieConsent(): CookieConsentHook {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasConsented, setHasConsented] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (storedConsent) {
        const parsed: CookieConsent = JSON.parse(storedConsent);
        
        // Check if consent version is current
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
          setHasConsented(true);
        } else {
          // Version mismatch - reset consent for updated policy
          localStorage.removeItem(CONSENT_STORAGE_KEY);
          setConsent(null);
          setHasConsented(false);
        }
      }
    } catch (error) {
      console.error('Error loading cookie consent:', error);
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    }
  }, []);

  // Update consent preferences
  const updateConsent = useCallback((newConsent: Partial<CookieConsent>) => {
    const updatedConsent: CookieConsent = {
      ...DEFAULT_CONSENT,
      ...consent,
      ...newConsent,
      essential: true, // Always true
      timestamp: Date.now(),
      version: CONSENT_VERSION
    };

    setConsent(updatedConsent);
    setHasConsented(true);
    
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updatedConsent));
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }

    // Trigger custom event for other parts of the app to respond
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
      detail: updatedConsent 
    }));
  }, [consent]);

  // Accept all optional cookies
  const acceptAll = useCallback(() => {
    updateConsent({
      analytics: true,
      preferences: true,
      marketing: true
    });
  }, [updateConsent]);

  // Reject all optional cookies (only essential)
  const rejectOptional = useCallback(() => {
    updateConsent({
      analytics: false,
      preferences: false,
      marketing: false
    });
  }, [updateConsent]);

  // Reset consent (for testing or policy updates)
  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setConsent(null);
    setHasConsented(false);
    
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
      detail: null 
    }));
  }, []);

  // Check if a specific category is allowed
  const isAllowed = useCallback((category: CookieCategory): boolean => {
    if (!consent) return category === 'essential';
    return consent[category] === true;
  }, [consent]);

  return {
    consent,
    hasConsented,
    updateConsent,
    acceptAll,
    rejectOptional,
    resetConsent,
    isAllowed
  };
}
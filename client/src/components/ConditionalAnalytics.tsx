import React, { useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { loadPlausibleAnalytics } from '@/utils/cookieUtils';

/**
 * Component that conditionally loads analytics based on user consent.
 * This should be placed in the app after cookie consent is available.
 */
export function ConditionalAnalytics() {
  const { consent, isAllowed } = useCookieConsent();

  useEffect(() => {
    // Only attempt to load analytics if we have consent data
    if (consent) {
      if (isAllowed('analytics')) {
        loadPlausibleAnalytics(isAllowed);
        console.log('📊 Analytics enabled by user consent');
      } else {
        console.log('📊 Analytics disabled by user choice');
      }
    }
  }, [consent, isAllowed]);

  // This component doesn't render anything visible
  return null;
}
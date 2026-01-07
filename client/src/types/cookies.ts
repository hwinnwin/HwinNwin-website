// Cookie consent types and configuration

export type CookieCategory = 'essential' | 'analytics' | 'preferences' | 'marketing';

export interface CookieInfo {
  name: string;
  description: string;
  examples: string[];
  required?: boolean;
}

export interface CookieConsent {
  essential: boolean; // Always true, but tracked for completeness
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
  timestamp: number;
  version: string; // For handling policy updates
}

// Check if Do Not Track is enabled
export function checkDoNotTrack(): boolean {
  if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
    return true;
  }
  // @ts-ignore - some browsers use this
  if (window.doNotTrack === '1' || window.doNotTrack === 'yes') {
    return true;
  }
  // @ts-ignore - IE and older Edge
  if (navigator.msDoNotTrack === '1') {
    return true;
  }
  return false;
}

export const COOKIE_CATEGORIES: Record<CookieCategory, CookieInfo> = {
  essential: {
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function properly. They enable basic features like page navigation, form submissions, and security. The website cannot function properly without these cookies.',
    examples: ['Session management', 'Security tokens', 'Form data', 'Cookie preferences'],
    required: true
  },
  analytics: {
    name: 'Analytics & Performance',
    description: 'These cookies help us understand how visitors interact with our website by collecting anonymous information about pages visited, time spent, and any errors encountered.',
    examples: ['Plausible Analytics', 'Page views', 'User interactions', 'Performance monitoring'],
    required: false
  },
  preferences: {
    name: 'Preference Cookies',
    description: 'These cookies remember your preferences and settings to provide a personalized experience, such as language preferences, location settings, and customized content.',
    examples: ['Language preferences', 'Theme settings', 'User preferences', 'Remembered forms'],
    required: false
  },
  marketing: {
    name: 'Marketing & Advertising',
    description: 'These cookies track your activity to help show more relevant advertisements and measure campaign effectiveness. We currently do not use marketing cookies.',
    examples: ['Ad targeting', 'Campaign tracking', 'Social media pixels', 'Remarketing'],
    required: false
  }
};

export const DEFAULT_CONSENT: CookieConsent = {
  essential: true, // Always required
  analytics: false,
  preferences: false,
  marketing: false,
  timestamp: Date.now(),
  version: '1.0'
};

export const CONSENT_STORAGE_KEY = 'cookie_consent';
export const CONSENT_VERSION = '1.0';
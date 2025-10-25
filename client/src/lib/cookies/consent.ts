const CONSENT_VERSION = 1;
const CONSENT_KEY = 'cookiePreferences';

export interface CookiePreferences {
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: number;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true, // Always true, non-toggleable
  preferences: false,
  analytics: false,
  marketing: false,
  timestamp: Date.now(),
  version: CONSENT_VERSION
};

type ConsentChangeCallback = (preferences: CookiePreferences) => void;
const listeners: ConsentChangeCallback[] = [];

export function getConsent(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as CookiePreferences;
    
    // Check if version matches - if not, return null to re-prompt
    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }
    
    // Ensure essential is always true
    parsed.essential = true;
    
    return parsed;
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
    return null;
  }
}

export function setConsent(preferences: Partial<CookiePreferences>): void {
  const current = getConsent() || DEFAULT_PREFERENCES;
  
  const updated: CookiePreferences = {
    ...current,
    ...preferences,
    essential: true, // Always true
    timestamp: Date.now(),
    version: CONSENT_VERSION
  };
  
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
    
    // Notify all listeners
    listeners.forEach(callback => callback(updated));
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
  }
}

export function hasConsent(): boolean {
  return getConsent() !== null;
}

export function onConsentChange(callback: ConsentChangeCallback): () => void {
  listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

export function checkDoNotTrack(): boolean {
  // Check if Do Not Track is enabled
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

export function getDefaultPreferences(): CookiePreferences {
  // If DNT is enabled, disable all non-essential cookies by default
  if (checkDoNotTrack()) {
    return {
      ...DEFAULT_PREFERENCES,
      preferences: false,
      analytics: false,
      marketing: false
    };
  }
  
  return DEFAULT_PREFERENCES;
}

export function acceptAll(): void {
  setConsent({
    preferences: true,
    analytics: true,
    marketing: true
  });
}

export function rejectAll(): void {
  setConsent({
    preferences: false,
    analytics: false,
    marketing: false
  });
}

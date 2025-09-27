import { CookieCategory } from '@/types/cookies';

// Utility functions for managing cookies and consent

export function loadScriptConditionally(
  src: string, 
  category: CookieCategory, 
  isAllowed: (category: CookieCategory) => boolean,
  attributes: Record<string, string> = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Only load if consent is given for this category
    if (!isAllowed(category)) {
      console.log(`Script ${src} not loaded - ${category} cookies not consented`);
      resolve();
      return;
    }

    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    // Add custom attributes
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    script.onload = () => {
      console.log(`✅ Loaded script: ${src} (${category})`);
      resolve();
    };

    script.onerror = () => {
      console.error(`❌ Failed to load script: ${src}`);
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });
}

export function loadPlausibleAnalytics(isAllowed: (category: CookieCategory) => boolean) {
  if (!isAllowed('analytics')) {
    console.log('📊 Analytics not loaded - consent not given');
    return;
  }

  // Load Plausible Analytics script
  loadScriptConditionally(
    'https://plausible.io/js/script.js',
    'analytics',
    isAllowed,
    {
      'data-domain': 'hwinnwin.com',
      'data-api': 'https://plausible.io/api/event'
    }
  ).catch(error => {
    console.error('Failed to load Plausible Analytics:', error);
  });
}

export function removeTrackingScripts() {
  // Remove analytics scripts when consent is revoked
  const scripts = document.querySelectorAll('script[src*="plausible"]');
  scripts.forEach(script => script.remove());

  // Clear any tracking data
  try {
    // Clear plausible local data if it exists
    localStorage.removeItem('plausible_ignore');
  } catch (error) {
    console.warn('Error clearing tracking data:', error);
  }
}

// Listen for consent changes and update script loading
export function setupConsentListener() {
  window.addEventListener('cookieConsentUpdated', (event: any) => {
    const consent = event.detail;
    
    if (!consent) {
      // Consent revoked - remove tracking
      removeTrackingScripts();
      return;
    }

    const isAllowed = (category: CookieCategory) => consent[category] === true;

    // Load analytics if consent given
    if (consent.analytics) {
      loadPlausibleAnalytics(isAllowed);
    } else {
      removeTrackingScripts();
    }
  });
}

export function getCookieValue(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export function deleteCookie(name: string, domain?: string, path: string = '/') {
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`;
  if (domain) {
    cookieString += ` domain=${domain};`;
  }
  document.cookie = cookieString;
}
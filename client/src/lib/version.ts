// App version for cache-busting
// Bump this when making significant changes to force fresh loads
export const APP_VERSION = '2025.10.25.1';
export const APP_BUILD = APP_VERSION;

/**
 * Adds version query parameter to URL for cache busting
 * Usage: getCacheBustedUrl('/assets/logo.png') => '/assets/logo.png?v=2025.10.25.1'
 * 
 * Use this for static assets that need to be refreshed when the app updates.
 * Example: <img src={getCacheBustedUrl('/static/banner.jpg')} alt="Banner" />
 */
export const getCacheBustedUrl = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${APP_BUILD}`;
};

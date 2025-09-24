import { useEffect } from 'react';
import { SITE_CONFIG } from '@/lib/constants';

interface SeoHeadProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function SeoHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage = `${SITE_CONFIG.baseUrl}/og-image.png`,
  ogType = 'website',
  canonicalUrl,
  keywords = [],
  noIndex = false
}: SeoHeadProps) {
  useEffect(() => {
    // Set page title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update meta description
    updateMeta('description', description);

    // Update Open Graph tags
    updateMeta('og:title', ogTitle || title, true);
    updateMeta('og:description', ogDescription || description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage, true);
    
    // Set canonical URL if provided
    if (canonicalUrl) {
      updateMeta('og:url', canonicalUrl, true);
      
      // Update or create canonical link
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Update keywords if provided
    if (keywords.length > 0) {
      updateMeta('keywords', keywords.join(', '));
    }

    // Handle noindex
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      // Remove noindex meta tag if it exists
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta && robotsMeta.getAttribute('content')?.includes('noindex')) {
        robotsMeta.remove();
      }
    }

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', ogTitle || title);
    updateMeta('twitter:description', ogDescription || description);
    updateMeta('twitter:image', ogImage);

    // Additional SEO meta tags
    updateMeta('author', 'HwinNwin');
    updateMeta('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1');
    
  }, [title, description, ogTitle, ogDescription, ogImage, ogType, canonicalUrl, keywords, noIndex]);

  // This component doesn't render anything - it only manages head tags
  return null;
}
import { useEffect } from 'react';
import { DEFAULT_SEO } from './defaults';
import { SITE_CONFIG } from '@/lib/constants';

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
}

export function SEO({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard,
  canonical
}: SEOProps) {
  useEffect(() => {
    // Use defaults if not provided
    const finalTitle = title || DEFAULT_SEO.title;
    const finalDescription = description || DEFAULT_SEO.description;
    const finalOgImage = ogImage || DEFAULT_SEO.ogImage;
    const finalTwitterCard = twitterCard || DEFAULT_SEO.twitterCard;

    // Set page title
    document.title = finalTitle;

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
    updateMeta('description', finalDescription);

    // Update Open Graph tags
    updateMeta('og:title', ogTitle || finalTitle, true);
    updateMeta('og:description', ogDescription || finalDescription, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', finalOgImage, true);
    updateMeta('og:site_name', SITE_CONFIG.name, true);

    // Update Twitter Card tags
    updateMeta('twitter:card', finalTwitterCard);
    updateMeta('twitter:title', ogTitle || finalTitle);
    updateMeta('twitter:description', ogDescription || finalDescription);
    updateMeta('twitter:image', finalOgImage);

    // Set canonical URL if provided
    if (canonical) {
      updateMeta('og:url', canonical, true);
      
      // Update or create canonical link
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

  }, [title, description, ogTitle, ogDescription, ogImage, ogType, twitterCard, canonical]);

  // This component doesn't render anything - it only manages head tags
  return null;
}

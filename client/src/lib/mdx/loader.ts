import matter from 'gray-matter';
import { Post, PostMeta } from '@/types/content';

// Import all markdown files with ?raw suffix for production builds
import consciousnessBridgingIntroRaw from '@/content/posts/consciousness-bridging-intro.md?raw';
import designingWithStateChangeAwarenessRaw from '@/content/posts/designing-with-state-change-awareness.md?raw';
import lumenAscendsRaw from '@/content/posts/lumen-ascends.md?raw';

// Map of slug to raw markdown content
const postsMap: Record<string, string> = {
  'lumen-ascends': lumenAscendsRaw,
  'consciousness-bridging-intro': consciousnessBridgingIntroRaw,
  'designing-with-state-change-awareness': designingWithStateChangeAwarenessRaw,
};

/**
 * Get all blog posts metadata sorted by date descending
 */
export function listPosts(): PostMeta[] {
  const posts: PostMeta[] = [];

  for (const [slug, rawContent] of Object.entries(postsMap)) {
    try {
      const { data } = matter(rawContent);
      posts.push({
        slug: data.slug || slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        excerpt: data.excerpt || '',
        ogImage: data.ogImage,
      });
    } catch (error) {
      console.error(`Error parsing post ${slug}:`, error);
    }
  }

  // Sort by date descending (newest first)
  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get a single blog post by slug
 * Returns null if post not found
 */
export function getPost(slug: string): Post | null {
  const rawContent = postsMap[slug];
  
  if (!rawContent) {
    console.warn(`Post not found: ${slug}`);
    return null;
  }

  try {
    const { data, content } = matter(rawContent);
    
    return {
      slug: data.slug || slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      ogImage: data.ogImage,
      content,
    };
  } catch (error) {
    console.error(`Error parsing post ${slug}:`, error);
    return null;
  }
}

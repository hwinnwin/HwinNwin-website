import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// Content directory paths
const CONTENT_DIR = path.join(process.cwd(), 'content');
const CASE_STUDIES_DIR = path.join(CONTENT_DIR, 'case-studies');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');

// Cache for parsed content (in-memory)
const contentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Types
export interface CaseStudyFrontmatter {
  title: string;
  client: string;
  stack: string[];
  results: string[];
}

export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  author: string;
  description: string;
}

export interface MdxContent<T = Record<string, any>> {
  frontmatter: T;
  content: string;
  slug?: string;
  lastModified?: number;
}

/**
 * Get cached content or fetch from disk
 */
function getFromCache(key: string): any | null {
  const cached = contentCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

/**
 * Store content in cache
 */
function setCache(key: string, data: any): void {
  contentCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Read and parse an MDX file
 */
async function parseMdxFile<T = Record<string, any>>(filePath: string): Promise<MdxContent<T>> {
  const cacheKey = `mdx:${filePath}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  const fileContent = await fs.readFile(filePath, 'utf-8');
  const stats = await fs.stat(filePath);
  const { data, content } = matter(fileContent);
  
  const result = {
    frontmatter: data as T,
    content: content.trim(),
    lastModified: stats.mtimeMs
  };

  setCache(cacheKey, result);
  return result;
}

/**
 * Get all MDX files from a directory
 */
async function getMdxFiles(directory: string): Promise<string[]> {
  try {
    const files = await fs.readdir(directory);
    return files.filter(file => file.endsWith('.mdx') || file.endsWith('.md'));
  } catch (error: any) {
    console.error(`Error reading directory ${directory}:`, error);
    throw error;
  }
}

/**
 * Get all case studies
 */
export async function getAllCaseStudies(): Promise<MdxContent<CaseStudyFrontmatter>[]> {
  const cacheKey = 'all-case-studies';
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const files = await getMdxFiles(CASE_STUDIES_DIR);
    const caseStudies = await Promise.all(
      files.map(async (file) => {
        const slug = file.replace(/\.mdx?$/, '');
        const filePath = path.join(CASE_STUDIES_DIR, file);
        const parsed = await parseMdxFile<CaseStudyFrontmatter>(filePath);
        return {
          ...parsed,
          slug
        };
      })
    );

    setCache(cacheKey, caseStudies);
    return caseStudies;
  } catch (error: any) {
    // Don't swallow errors - let them propagate
    console.error('Error loading case studies:', error);
    throw error;
  }
}

/**
 * Get a single case study by slug
 * Tries .mdx first, then falls back to .md
 */
export async function getCaseStudy(slug: string): Promise<MdxContent<CaseStudyFrontmatter> | null> {
  const cacheKey = `case-study:${slug}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Try .mdx first
    let filePath = path.join(CASE_STUDIES_DIR, `${slug}.mdx`);
    
    try {
      await fs.access(filePath);
    } catch {
      // Fall back to .md
      filePath = path.join(CASE_STUDIES_DIR, `${slug}.md`);
    }
    
    const result = await parseMdxFile<CaseStudyFrontmatter>(filePath);
    setCache(cacheKey, result);
    return result;
  } catch (error: any) {
    // Only return null for file not found
    if (error.code === 'ENOENT') {
      console.log(`Case study not found: ${slug}`);
      return null;
    }
    // Rethrow all other errors (permission, parsing, etc.)
    console.error(`Error loading case study ${slug}:`, error);
    throw error;
  }
}

/**
 * Get all blog posts
 */
export async function getAllBlogPosts(): Promise<MdxContent<BlogPostFrontmatter>[]> {
  const cacheKey = 'all-blog-posts';
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const files = await getMdxFiles(BLOG_DIR);
    const blogPosts = await Promise.all(
      files.map(async (file) => {
        const slug = file.replace(/\.mdx?$/, '');
        const filePath = path.join(BLOG_DIR, file);
        const parsed = await parseMdxFile<BlogPostFrontmatter>(filePath);
        return {
          ...parsed,
          slug
        };
      })
    );

    // Sort by date descending (newest first)
    const sorted = blogPosts.sort((a, b) => {
      const dateA = new Date(a.frontmatter.date).getTime();
      const dateB = new Date(b.frontmatter.date).getTime();
      return dateB - dateA;
    });

    setCache(cacheKey, sorted);
    return sorted;
  } catch (error: any) {
    // Don't swallow errors - let them propagate
    console.error('Error loading blog posts:', error);
    throw error;
  }
}

/**
 * Get a single blog post by slug
 * Tries .mdx first, then falls back to .md
 */
export async function getBlogPost(slug: string): Promise<MdxContent<BlogPostFrontmatter> | null> {
  const cacheKey = `blog-post:${slug}`;
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Try .mdx first
    let filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    
    try {
      await fs.access(filePath);
    } catch {
      // Fall back to .md
      filePath = path.join(BLOG_DIR, `${slug}.md`);
    }
    
    const result = await parseMdxFile<BlogPostFrontmatter>(filePath);
    setCache(cacheKey, result);
    return result;
  } catch (error: any) {
    // Only return null for file not found
    if (error.code === 'ENOENT') {
      console.log(`Blog post not found: ${slug}`);
      return null;
    }
    // Rethrow all other errors (permission, parsing, etc.)
    console.error(`Error loading blog post ${slug}:`, error);
    throw error;
  }
}

/**
 * Clear the content cache (useful for development or after content updates)
 */
export function clearContentCache(): void {
  contentCache.clear();
  console.log('📝 Content cache cleared');
}

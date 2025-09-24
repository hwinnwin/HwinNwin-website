import yaml from 'yaml';
import matter from 'gray-matter';

// Brand content types
export interface BrandData {
  name: string;
  tagline: string;
  pillars: string[];
  voice: {
    tone: string;
    rules: string[];
  };
  organization: {
    legal_name: string;
    hq: string;
    email_public: string;
    booking_link: string;
  };
}

// Services content types
export interface ServiceItem {
  name: string;
  promise: string;
  outcomes: string[];
  from_aud: number;
}

export interface ServicesData {
  items: ServiceItem[];
}

// Home content types
export interface ThreePItem {
  title: string;
  text: string;
  metric: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface HomeData {
  hero: {
    headline: string;
    sub: string;
    primary_cta: string;
    secondary_cta: string;
  };
  threeP: {
    items: ThreePItem[];
  };
  process: string[];
  logos: string[];
  faq: FaqItem[];
}

// MDX content types
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
}

// Content loader functions
export async function loadBrandData(): Promise<BrandData> {
  try {
    const response = await fetch('/content/brand.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load brand.yaml: ${response.status}`);
    }
    const yamlContent = await response.text();
    return yaml.parse(yamlContent) as BrandData;
  } catch (error) {
    console.error('Error loading brand data:', error);
    throw new Error('Failed to load brand data');
  }
}

export async function loadServicesData(): Promise<ServicesData> {
  try {
    const response = await fetch('/content/services.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load services.yaml: ${response.status}`);
    }
    const yamlContent = await response.text();
    return yaml.parse(yamlContent) as ServicesData;
  } catch (error) {
    console.error('Error loading services data:', error);
    throw new Error('Failed to load services data');
  }
}

export async function loadHomeData(): Promise<HomeData> {
  try {
    const response = await fetch('/content/home.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load home.yaml: ${response.status}`);
    }
    const yamlContent = await response.text();
    return yaml.parse(yamlContent) as HomeData;
  } catch (error) {
    console.error('Error loading home data:', error);
    throw new Error('Failed to load home data');
  }
}

export async function loadAboutContent(): Promise<string> {
  try {
    const response = await fetch('/content/about.md');
    if (!response.ok) {
      throw new Error(`Failed to load about.md: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading about content:', error);
    throw new Error('Failed to load about content');
  }
}

export async function loadLegalContent(type: 'privacy' | 'terms' | 'cookies'): Promise<string> {
  try {
    const response = await fetch(`/content/legal/${type}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load ${type}.md: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading ${type} content:`, error);
    throw new Error(`Failed to load ${type} content`);
  }
}

export async function loadCaseStudy(slug: string): Promise<MdxContent<CaseStudyFrontmatter>> {
  try {
    const response = await fetch(`/content/case-studies/${slug}.mdx`);
    if (!response.ok) {
      throw new Error(`Failed to load case study ${slug}: ${response.status}`);
    }
    const mdxContent = await response.text();
    const { data, content } = matter(mdxContent);
    
    return {
      frontmatter: data as CaseStudyFrontmatter,
      content
    };
  } catch (error) {
    console.error(`Error loading case study ${slug}:`, error);
    throw new Error(`Failed to load case study: ${slug}`);
  }
}

export async function loadBlogPost(slug: string): Promise<MdxContent<BlogPostFrontmatter>> {
  try {
    const response = await fetch(`/content/blog/${slug}.mdx`);
    if (!response.ok) {
      throw new Error(`Failed to load blog post ${slug}: ${response.status}`);
    }
    const mdxContent = await response.text();
    const { data, content } = matter(mdxContent);
    
    return {
      frontmatter: data as BlogPostFrontmatter,
      content
    };
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error);
    throw new Error(`Failed to load blog post: ${slug}`);
  }
}

// Utility function to get all case studies
export async function getAllCaseStudies(): Promise<MdxContent<CaseStudyFrontmatter>[]> {
  const caseStudySlugs = ['ops-time-cut', 'content-pipeline', 'sales-enablement'];
  
  try {
    const caseStudies = await Promise.all(
      caseStudySlugs.map(slug => loadCaseStudy(slug))
    );
    return caseStudies;
  } catch (error) {
    console.error('Error loading case studies:', error);
    throw new Error('Failed to load case studies');
  }
}

// Utility function to get all blog posts
export async function getAllBlogPosts(): Promise<MdxContent<BlogPostFrontmatter>[]> {
  const blogSlugs = ['small-systems-win', 'three-p-check'];
  
  try {
    const blogPosts = await Promise.all(
      blogSlugs.map(slug => loadBlogPost(slug))
    );
    // Sort by date (newest first)
    return blogPosts.sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    );
  } catch (error) {
    console.error('Error loading blog posts:', error);
    throw new Error('Failed to load blog posts');
  }
}

// Comprehensive content loader for common site data
export interface SiteData {
  brand: BrandData;
  services: ServicesData;
  home: HomeData;
}

export async function loadSiteData(): Promise<SiteData> {
  try {
    const [brand, services, home] = await Promise.all([
      loadBrandData(),
      loadServicesData(),
      loadHomeData()
    ]);

    return { brand, services, home };
  } catch (error) {
    console.error('Error loading site data:', error);
    throw new Error('Failed to load site data');
  }
}
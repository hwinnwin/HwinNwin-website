import yaml from 'yaml';

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
    const response = await fetch(`/api/content/case-studies/${slug}`);
    if (!response.ok) {
      throw new Error(`Failed to load case study ${slug}: ${response.status}`);
    }
    const data = await response.json();
    
    return {
      frontmatter: data.frontmatter as CaseStudyFrontmatter,
      content: data.content
    };
  } catch (error) {
    console.error(`Error loading case study ${slug}:`, error);
    throw new Error(`Failed to load case study: ${slug}`);
  }
}

export async function loadBlogPost(slug: string): Promise<MdxContent<BlogPostFrontmatter>> {
  try {
    const response = await fetch(`/api/content/blog/${slug}`);
    if (!response.ok) {
      throw new Error(`Failed to load blog post ${slug}: ${response.status}`);
    }
    const data = await response.json();
    
    return {
      frontmatter: data.frontmatter as BlogPostFrontmatter,
      content: data.content
    };
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error);
    throw new Error(`Failed to load blog post: ${slug}`);
  }
}

// Utility function to get all case studies
export async function getAllCaseStudies(): Promise<(MdxContent<CaseStudyFrontmatter> & {slug: string})[]> {
  try {
    const response = await fetch('/api/content/case-studies');
    if (!response.ok) {
      throw new Error(`Failed to load case studies: ${response.status}`);
    }
    const caseStudies = await response.json();
    
    return caseStudies.map((study: any) => ({
      frontmatter: study.frontmatter as CaseStudyFrontmatter,
      content: study.content,
      slug: study.slug
    }));
  } catch (error) {
    console.error('Error loading case studies:', error);
    throw new Error('Failed to load case studies');
  }
}

// Utility function to get all blog posts
export async function getAllBlogPosts(): Promise<MdxContent<BlogPostFrontmatter>[]> {
  try {
    const response = await fetch('/api/content/blog');
    if (!response.ok) {
      throw new Error(`Failed to load blog posts: ${response.status}`);
    }
    const blogPosts = await response.json();
    
    return blogPosts.map((post: any) => ({
      frontmatter: post.frontmatter as BlogPostFrontmatter,
      content: post.content
    }));
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
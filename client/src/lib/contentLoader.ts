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
    console.log('🔄 Loading brand data...');
    const response = await fetch('/content/brand.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load brand.yaml: ${response.status} ${response.statusText}`);
    }
    const yamlContent = await response.text();
    console.log('✅ Brand YAML loaded, parsing...');
    const parsed = yaml.parse(yamlContent) as BrandData;
    console.log('✅ Brand data parsed successfully');
    return parsed;
  } catch (error) {
    console.error('❌ Error loading brand data:', error);
    throw new Error(`Failed to load brand data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function loadServicesData(): Promise<ServicesData> {
  try {
    console.log('🔄 Loading services data...');
    const response = await fetch('/content/services.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load services.yaml: ${response.status} ${response.statusText}`);
    }
    const yamlContent = await response.text();
    console.log('✅ Services YAML loaded, parsing...');
    const parsed = yaml.parse(yamlContent) as ServicesData;
    console.log('✅ Services data parsed successfully');
    return parsed;
  } catch (error) {
    console.error('❌ Error loading services data:', error);
    throw new Error(`Failed to load services data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function loadHomeData(): Promise<HomeData> {
  try {
    console.log('🔄 Loading home data...');
    const response = await fetch('/content/home.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load home.yaml: ${response.status} ${response.statusText}`);
    }
    const yamlContent = await response.text();
    console.log('✅ Home YAML loaded, parsing...');
    const parsed = yaml.parse(yamlContent) as HomeData;
    console.log('✅ Home data parsed successfully');
    return parsed;
  } catch (error) {
    console.error('❌ Error loading home data:', error);
    throw new Error(`Failed to load home data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    console.log('🔄 Loading site data for Safari/mobile...');
    
    const [brand, services, home] = await Promise.all([
      loadBrandData(),
      loadServicesData(),
      loadHomeData()
    ]);

    console.log('✅ All site data loaded successfully');
    return { brand, services, home };
  } catch (error) {
    console.error('❌ Error loading site data:', error);
    
    // Provide fallback data for Safari/mobile compatibility
    console.log('🔄 Providing fallback data to prevent blank screen...');
    return {
      brand: {
        name: "HwinNwin",
        tagline: "Helping Businesses Scale with Structure, Mindset, and Excellence",
        pillars: ["AI Automation", "Creative Systems", "Strategic Planning"],
        voice: {
          tone: "Professional and supportive",
          rules: ["Clear communication", "Results-focused", "Empowering"]
        },
        organization: {
          legal_name: "HwinNwin Pty Ltd",
          hq: "Melbourne, Australia",
          email_public: "hello@hwinnwin.com",
          booking_link: "/hwin/contact"
        }
      },
      services: {
        items: [
          {
            name: "AI Automation",
            promise: "Streamline your operations with intelligent automation",
            outcomes: ["Increased efficiency", "Reduced costs", "Better accuracy"],
            from_aud: 2500
          },
          {
            name: "Creative Systems",
            promise: "Build creative workflows that scale",
            outcomes: ["Consistent quality", "Faster delivery", "Enhanced creativity"],
            from_aud: 1500
          },
          {
            name: "Strategic Planning",
            promise: "Develop clear roadmaps for growth",
            outcomes: ["Clear direction", "Aligned teams", "Measurable progress"],
            from_aud: 3000
          }
        ]
      },
      home: {
        hero: {
          headline: "Helping Businesses Scale with Structure, Mindset, and Excellence",
          sub: "We deliver powerful solutions with balanced approach for lasting prosperity.",
          primary_cta: "Get Started",
          secondary_cta: "View Our Work"
        },
        threeP: {
          items: [
            {
              title: "Productive",
              text: "Efficient systems that get results",
              metric: "300% ROI"
            },
            {
              title: "Profitable",
              text: "Solutions that drive revenue growth",
              metric: "2x Revenue"
            },
            {
              title: "Peaceful",
              text: "Stress-free operations and clarity",
              metric: "90% Satisfaction"
            }
          ]
        },
        process: [
          "Discovery & Analysis",
          "Strategy Development", 
          "Implementation",
          "Optimization"
        ],
        logos: [],
        faq: [
          {
            q: "How do you help businesses scale?",
            a: "We provide AI automation, creative systems, and strategic planning to help businesses grow efficiently and sustainably."
          }
        ]
      }
    };
  }
}
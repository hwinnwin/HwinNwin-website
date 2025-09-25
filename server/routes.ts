import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";

import path from "path";
import { storage } from "./storage";
import { EmailService } from "./services/emailService";
import { PDFService } from "./services/pdfService";
import { ImageService } from "./services/imageService";
import { calculateQuote, validatePhotos } from "./services/quoteCalculator";
import { quoteRateLimiter, generalRateLimiter, pinChangeRateLimiter } from "./middleware/rateLimiter";
import { requireOwnerPin, createOwnerSession, requireOwnerSession, requirePending2FA } from "./middleware/ownerAuth";
import { insertQuoteSchema, insertSettingsSchema, insertTestimonialSchema, firstTimePinChangeSchema, pinChangeSchema, contactFormSchema, marketingContentSchema, loginSchema, otpVerificationSchema, twoFaSettingsSchema } from "@shared/schema";
import { hashPin, comparePin, isPinHashed } from "./services/pinService";
import { generateOTPRecord, verifyOTP, isOTPExpired, clearOTPData, isValidOTPFormat } from "./services/otpService";
import { z } from "zod";
import fs from "fs/promises";
import matter from "gray-matter";

// Helper function to generate meta tags for SEO
function generateSeoMeta(pageData: {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl: string;
  keywords?: string[];
}) {
  const baseUrl = process.env.BASE_URL || 'https://hwinnwin.com';
  const ogImage = pageData.ogImage || `${baseUrl}/og-image.png`;
  
  return `
    <title>${pageData.title}</title>
    <meta name="description" content="${pageData.description}" />
    <meta name="keywords" content="${pageData.keywords?.join(', ') || ''}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${pageData.ogTitle || pageData.title}" />
    <meta property="og:description" content="${pageData.ogDescription || pageData.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageData.canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="HwinNwin" />
    
    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageData.ogTitle || pageData.title}" />
    <meta name="twitter:description" content="${pageData.ogDescription || pageData.description}" />
    <meta name="twitter:image" content="${ogImage}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${pageData.canonicalUrl}" />
  `;
}

// Helper function to inject meta tags into HTML template
async function servePageWithMeta(res: any, pageData: any) {
  try {
    const baseUrl = process.env.BASE_URL || 'https://hwinnwin.com';
    const indexPath = path.join(process.cwd(), 'client', 'index.html');
    let html = await fs.readFile(indexPath, 'utf-8');
    
    // Generate meta tags
    const metaTags = generateSeoMeta({
      ...pageData,
      canonicalUrl: `${baseUrl}${pageData.path}`
    });
    
    // Replace or inject meta tags in the head section
    // Find the existing title and replace the head content up to </title>
    const headRegex = /(<title>[\s\S]*?<\/title>)/;
    if (headRegex.test(html)) {
      html = html.replace(headRegex, metaTags.trim());
    } else {
      // Fallback: inject before closing head tag
      html = html.replace('</head>', `${metaTags}\n  </head>`);
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error serving page with meta:', error);
    res.status(500).send('Internal Server Error');
  }
}

// Helper function to safely parse JSON and handle 'undefined' strings
function safeJsonParse<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString, 'returning default:', defaultValue);
    return defaultValue;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const imageService = new ImageService();
  const upload = imageService.createMulterUpload();

  // Serve uploaded images
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Serve content directory for static files
  app.use('/content', express.static(path.join(process.cwd(), 'content')));

  // SEO Routes - robots.txt and sitemap.xml (with dynamic BASE_URL)
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.BASE_URL || 'https://hwinnwin.com';
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`);
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL || 'https://hwinnwin.com';
      
      // Static marketing pages
      const staticPages: { url: string; priority: string; lastmod?: string }[] = [
        { url: '/', priority: '1.0' },
        { url: '/hwin', priority: '1.0' },
        { url: '/hwin/services', priority: '0.9' },
        { url: '/hwin/about', priority: '0.8' },
        { url: '/hwin/work', priority: '0.8' },
        { url: '/hwin/insights', priority: '0.7' },
        { url: '/hwin/contact', priority: '0.7' },
      ];

      // Read case studies dynamically
      const caseStudies: { url: string; priority: string; lastmod?: string }[] = [];
      try {
        const caseStudiesDir = path.join(process.cwd(), 'content', 'case-studies');
        const caseStudyFiles = await fs.readdir(caseStudiesDir);
        
        for (const file of caseStudyFiles) {
          if (file.endsWith('.mdx')) {
            const slug = file.replace('.mdx', '');
            const filePath = path.join(caseStudiesDir, file);
            const stats = await fs.stat(filePath);
            
            caseStudies.push({
              url: `/hwin/work/${slug}`,
              priority: '0.7',
              lastmod: stats.mtime.toISOString().split('T')[0]
            });
          }
        }
      } catch (error) {
        console.error('Error reading case studies for sitemap:', error);
      }

      // Read blog posts dynamically
      const blogPosts: { url: string; priority: string; lastmod?: string }[] = [];
      try {
        const blogDir = path.join(process.cwd(), 'content', 'blog');
        const blogFiles = await fs.readdir(blogDir);
        
        for (const file of blogFiles) {
          if (file.endsWith('.mdx')) {
            const slug = file.replace('.mdx', '');
            const filePath = path.join(blogDir, file);
            const stats = await fs.stat(filePath);
            
            blogPosts.push({
              url: `/hwin/insights/${slug}`,
              priority: '0.6',
              lastmod: stats.mtime.toISOString().split('T')[0]
            });
          }
        }
      } catch (error) {
        console.error('Error reading blog posts for sitemap:', error);
      }

      // Generate XML
      const allUrls = [...staticPages, ...caseStudies, ...blogPosts];
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const page of allUrls) {
        xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>`;
        
        if (page.lastmod) {
          xml += `
    <lastmod>${page.lastmod}</lastmod>`;
        }
        
        xml += `
  </url>`;
      }

      xml += `
</urlset>`;

      res.type('application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Marketing Routes with Server-Side Meta Tag Injection
  // Home page
  app.get('/hwin', async (req, res) => {
    await servePageWithMeta(res, {
      path: '/hwin',
      title: 'HwinNwin - AI Automation & Creative Ecosystems',
      description: 'Scale your business with AI automation and creative ecosystems. We deliver powerful solutions with balanced approach for lasting prosperity in Melbourne, Australia.',
      ogTitle: 'HwinNwin - AI Automation & Creative Ecosystems',
      ogDescription: 'Professional business solutions including AI automation, creative systems, consulting, and strategic planning to help Australian businesses thrive.',
      keywords: ['AI automation', 'creative ecosystems', 'business scaling', 'Melbourne business consulting', 'strategic planning', 'implementation support']
    });
  });

  // Services page
  app.get('/hwin/services', async (req, res) => {
    await servePageWithMeta(res, {
      path: '/hwin/services',
      title: 'Our Services - HwinNwin',
      description: 'Comprehensive AI automation and creative systems solutions designed to scale your business with structure, mindset, and excellence. Professional consulting services in Melbourne, Australia.',
      ogTitle: 'Our Services - HwinNwin',
      ogDescription: 'From AI automation to creative systems implementation, we offer comprehensive business solutions starting from AUD 5,000. Melbourne-based consulting.',
      keywords: ['AI automation services', 'creative systems', 'business consulting Melbourne', 'strategic planning', 'implementation support', 'custom solutions']
    });
  });

  // About page
  app.get('/hwin/about', async (req, res) => {
    await servePageWithMeta(res, {
      path: '/hwin/about',
      title: 'About HwinNwin - Structure, Mindset, Excellence',
      description: 'Learn about HwinNwin\'s mission to help businesses scale with structure, mindset, and excellence through our proven 3P Check methodology. Melbourne-based business consultants.',
      ogTitle: 'About HwinNwin - Structure, Mindset, Excellence',
      ogDescription: 'Discover how HwinNwin helps Australian businesses achieve sustainable growth through our proven 3P Check: Power, Balance, and Prosperity.',
      keywords: ['HwinNwin', 'business consulting', '3P Check methodology', 'structure mindset excellence', 'Melbourne consultants', 'sustainable growth']
    });
  });

  // Case Studies / Work page
  app.get('/hwin/work', async (req, res) => {
    await servePageWithMeta(res, {
      path: '/hwin/work',
      title: 'Our Work - Case Studies | HwinNwin',
      description: 'Explore our proven case studies showcasing AI automation and creative systems implementations. Real results from Melbourne businesses across various industries.',
      ogTitle: 'Our Work - Case Studies | HwinNwin',
      ogDescription: 'See how we\'ve helped Australian businesses scale with AI automation, creative systems, and strategic implementations. Real results, measurable impact.',
      keywords: ['case studies', 'business automation results', 'Melbourne consulting success', 'AI implementation examples', 'creative systems case studies']
    });
  });

  // Individual case study pages
  app.get('/hwin/work/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const filePath = path.join(process.cwd(), 'content', 'case-studies', `${slug}.mdx`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data } = matter(fileContent);
      
      await servePageWithMeta(res, {
        path: `/hwin/work/${slug}`,
        title: `${data.title || slug} - Case Study | HwinNwin`,
        description: data.summary || `Detailed case study showing how HwinNwin helped implement ${data.title || slug} solution for improved business outcomes.`,
        ogTitle: `${data.title || slug} - Case Study | HwinNwin`,
        ogDescription: data.summary || `Real-world implementation case study: ${data.title || slug}. See measurable results and business impact.`,
        keywords: data.tags || ['case study', 'business consulting', 'implementation', 'results']
      });
    } catch (error) {
      console.error(`Error serving case study ${req.params.slug}:`, error);
      res.status(404).send('Case study not found');
    }
  });

  // Blog / Insights page
  app.get('/hwin/insights', async (req, res) => {
    await servePageWithMeta(res, {
      path: '/hwin/insights',
      title: 'Business Insights & Articles | HwinNwin',
      description: 'Strategic business insights, AI automation guides, and creative systems articles. Expert advice from Melbourne consultants on scaling your business effectively.',
      ogTitle: 'Business Insights & Articles | HwinNwin',
      ogDescription: 'Read expert insights on business scaling, AI automation, and creative systems from Melbourne-based consultants. Practical advice for sustainable growth.',
      keywords: ['business insights', 'AI automation guides', 'scaling strategies', 'Melbourne business advice', 'creative systems blog', 'consulting articles']
    });
  });

  // Individual blog post pages
  app.get('/hwin/insights/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.mdx`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data } = matter(fileContent);
      
      await servePageWithMeta(res, {
        path: `/hwin/insights/${slug}`,
        title: `${data.title || slug} | HwinNwin Blog`,
        description: data.summary || data.description || `Expert insights on ${data.title || slug} from HwinNwin business consultants. Practical advice for scaling your business.`,
        ogTitle: `${data.title || slug} | HwinNwin Blog`,
        ogDescription: data.summary || data.description || `Business insights: ${data.title || slug}. Expert advice from Melbourne consultants on scaling and automation.`,
        keywords: data.tags || ['business insights', 'scaling', 'automation', 'consulting']
      });
    } catch (error) {
      console.error(`Error serving blog post ${req.params.slug}:`, error);
      res.status(404).send('Blog post not found');
    }
  });

  // Contact page
  app.get('/hwin/contact', async (req, res) => {
    await servePageWithMeta(res, {
      path: '/hwin/contact',
      title: 'Contact Us - Get Started Today | HwinNwin',
      description: 'Ready to scale your business? Contact HwinNwin for AI automation, creative systems, and strategic consulting. Melbourne-based consultants ready to help.',
      ogTitle: 'Contact Us - Get Started Today | HwinNwin',
      ogDescription: 'Start your business transformation today. Contact Melbourne-based consultants for AI automation, creative systems, and strategic planning services.',
      keywords: ['contact business consultants', 'Melbourne consulting', 'AI automation consultation', 'business scaling help', 'get started']
    });
  });

  // Content API endpoints for MDX processing
  app.get('/api/content/case-studies', async (req, res) => {
    try {
      const caseStudySlugs = ['ops-time-cut', 'content-pipeline', 'sales-enablement'];
      const caseStudies = [];

      for (const slug of caseStudySlugs) {
        try {
          const filePath = path.join(process.cwd(), 'content', 'case-studies', `${slug}.mdx`);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const { data, content } = matter(fileContent);
          
          caseStudies.push({
            slug,
            frontmatter: data,
            content
          });
        } catch (error) {
          console.error(`Error loading case study ${slug}:`, error);
          // Continue with other case studies
        }
      }

      res.json(caseStudies);
    } catch (error) {
      console.error('Error loading case studies:', error);
      res.status(500).json({ message: 'Failed to load case studies' });
    }
  });

  app.get('/api/content/case-studies/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const filePath = path.join(process.cwd(), 'content', 'case-studies', `${slug}.mdx`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      res.json({
        slug,
        frontmatter: data,
        content
      });
    } catch (error) {
      console.error(`Error loading case study ${req.params.slug}:`, error);
      res.status(404).json({ message: 'Case study not found' });
    }
  });

  app.get('/api/content/blog', async (req, res) => {
    try {
      const blogSlugs = ['small-systems-win', 'three-p-check'];
      const blogPosts = [];

      for (const slug of blogSlugs) {
        try {
          const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.mdx`);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const { data, content } = matter(fileContent);
          
          blogPosts.push({
            slug,
            frontmatter: data,
            content
          });
        } catch (error) {
          console.error(`Error loading blog post ${slug}:`, error);
          // Continue with other posts
        }
      }

      // Sort by date (newest first)
      blogPosts.sort((a, b) => 
        new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
      );

      res.json(blogPosts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      res.status(500).json({ message: 'Failed to load blog posts' });
    }
  });

  app.get('/api/content/blog/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.mdx`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      res.json({
        slug,
        frontmatter: data,
        content
      });
    } catch (error) {
      console.error(`Error loading blog post ${req.params.slug}:`, error);
      res.status(404).json({ message: 'Blog post not found' });
    }
  });

  // Site data endpoint for marketing pages
  app.get('/api/content/site-data', async (req, res) => {
    try {
      const yaml = await import('yaml');
      
      // Load brand data with error handling
      let brand = {};
      try {
        const brandPath = path.join(process.cwd(), 'content', 'brand.yaml');
        const brandContent = await fs.readFile(brandPath, 'utf-8');
        brand = yaml.parse(brandContent);
      } catch (error) {
        console.warn('Brand data not found, using defaults');
        brand = { name: 'HwinNwin', tagline: 'Helping Businesses Scale' };
      }
      
      // Load services data with error handling
      let services = { items: [] };
      try {
        const servicesPath = path.join(process.cwd(), 'content', 'services.yaml');
        const servicesContent = await fs.readFile(servicesPath, 'utf-8');
        services = yaml.parse(servicesContent);
      } catch (error) {
        console.warn('Services data not found, using defaults');
        services = { items: [] };
      }
      
      // Load home data with error handling
      let home = {
        hero: {
          headline: 'AI Automation & Creative Ecosystems',
          sub: 'We deliver powerful solutions with balanced approach for lasting prosperity.',
          primary_cta: 'Get Started',
          secondary_cta: 'View Our Work'
        },
        threeP: { items: [] },
        process: [],
        faq: []
      };
      try {
        const homePath = path.join(process.cwd(), 'content', 'home.yaml');
        const homeContent = await fs.readFile(homePath, 'utf-8');
        home = yaml.parse(homeContent);
      } catch (error) {
        console.warn('Home data not found, using defaults');
      }
      
      res.json({ brand, services, home });
    } catch (error) {
      console.error('Error loading site data:', error);
      // Return minimal working data instead of error
      res.json({
        brand: { name: 'HwinNwin', tagline: 'Helping Businesses Scale' },
        services: { items: [] },
        home: {
          hero: {
            headline: 'AI Automation & Creative Ecosystems',
            sub: 'We deliver powerful solutions with balanced approach for lasting prosperity.',
            primary_cta: 'Get Started',
            secondary_cta: 'View Our Work'
          },
          threeP: { items: [] },
          process: [],
          faq: []
        }
      });
    }
  });

  // Contact form endpoint for marketing site
  app.post('/api/contact', async (req, res) => {
    try {
      // Validate request data and check honeypot fields
      const validationResult = contactFormSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const { name, email, company, phone, service, message, website, url, honeypot } = validationResult.data;

      // Additional spam protection - honeypot fields should be empty
      if (website || url || honeypot) {
        return res.status(400).json({ message: "Invalid request" });
      }

      // Get settings for email service
      const settings = await storage.getSettings();
      const emailService = new EmailService(settings);

      if (!emailService.isConfigured()) {
        console.warn('Contact form submitted but email service not configured');
        return res.status(500).json({ 
          message: "Email service not configured. Please try again later or contact us directly." 
        });
      }

      // Prepare contact information for email
      const serviceLabels: Record<string, string> = {
        consulting: "Business Consulting",
        strategy: "Strategic Planning", 
        implementation: "Implementation Support",
        custom: "Custom Solution",
        other: "Other"
      };

      const serviceLabel = service && serviceLabels[service] ? serviceLabels[service] : service || "Not specified";
      
      // Send notification email to business
      const businessEmailResult = await emailService.sendEmail({
        to: settings.fromEmail || 'contact@hwinwwin.com',
        from: settings.fromEmail || 'contact@hwinwwin.com',
        subject: `New Contact Form Submission - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #D4AF37; color: white; padding: 20px; text-align: center;">
              <h1>HwinNwin</h1>
              <p>New Contact Form Submission</p>
            </div>
            
            <div style="padding: 20px;">
              <h2>Contact Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                ${company ? `<tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 0; font-weight: bold;">Company:</td>
                  <td style="padding: 8px 0;">${company}</td>
                </tr>` : ''}
                ${phone ? `<tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;">${phone}</td>
                </tr>` : ''}
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 0; font-weight: bold;">Service Interest:</td>
                  <td style="padding: 8px 0;">${serviceLabel}</td>
                </tr>
              </table>
              
              <h3>Message</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <strong>Response recommended within:</strong> 24 hours<br>
                <strong>Submission time:</strong> ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })}
              </p>
            </div>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}
${phone ? `Phone: ${phone}` : ''}
Service Interest: ${serviceLabel}

Message:
${message}

Submitted: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })}
        `
      });

      // Send confirmation email to customer
      const customerEmailResult = await emailService.sendEmail({
        to: email,
        from: settings.fromEmail || 'contact@hwinwwin.com',
        subject: "Thank you for contacting HwinNwin - We'll be in touch soon",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #D4AF37; color: white; padding: 20px; text-align: center;">
              <h1>HwinNwin</h1>
              <p>Helping Businesses Scale with Structure, Mindset, and Excellence</p>
            </div>
            
            <div style="padding: 20px;">
              <h2>Thank you for your interest!</h2>
              
              <p>Dear ${name},</p>
              
              <p>We've received your message and appreciate you taking the time to reach out to us. Our team will review your inquiry and respond within 24 hours.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #D4AF37;">Your inquiry summary:</h3>
                <p><strong>Service Interest:</strong> ${serviceLabel}</p>
                <p><strong>Message:</strong> ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}</p>
              </div>
              
              <p>In the meantime, feel free to explore our <a href="${settings.siteUrl}/services" style="color: #D4AF37;">services</a> or read about our approach on our <a href="${settings.siteUrl}/blog" style="color: #D4AF37;">blog</a>.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <p><strong>The HwinNwin Team</strong><br>
                Melbourne, Australia</p>
              </div>
              
              <p style="font-size: 12px; color: #666;">
                This is an automated confirmation. Please don't reply to this email. 
                If you need immediate assistance, please contact us directly.
              </p>
            </div>
          </div>
        `,
        text: `
Dear ${name},

Thank you for contacting HwinNwin. We've received your message and will respond within 24 hours.

Your inquiry summary:
Service Interest: ${serviceLabel}
Message: ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}

In the meantime, feel free to explore our website at ${settings.siteUrl}

Best regards,
The HwinNwin Team
Melbourne, Australia
        `
      });

      const emailSent = businessEmailResult.success && customerEmailResult.success;

      res.status(200).json({
        message: "Contact form submitted successfully. We'll be in touch within 24 hours.",
        emailSent,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Contact form submission error:', error);
      res.status(500).json({ 
        message: "Failed to submit contact form. Please try again later." 
      });
    }
  });

  // Apply rate limiting
  app.use('/api/quote', quoteRateLimiter.middleware());
  app.use('/api', generalRateLimiter.middleware());

  // Honeypot middleware for spam protection
  app.use('/api/quote', (req, res, next) => {
    if (req.body.website || req.body.url || req.body.honeypot) {
      return res.status(400).json({ message: "Invalid request" });
    }
    next();
  });

  // Quote submission (customer)
  app.post('/api/quote', upload.array('photos', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[] || [];
      
      // Validate request data
      const validationResult = insertQuoteSchema.safeParse({
        ...req.body,
        items: JSON.parse(req.body.items || '[]'),
        photosRepresentativeConfirmed: req.body.photosRepresentativeConfirmed === 'true',
        provisionalEstimateConfirmed: req.body.provisionalEstimateConfirmed === 'true'
      });

      if (!validationResult.success) {
        // Clean up uploaded files
        for (const file of files) {
          await imageService.deleteImage(file.filename);
        }
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const quoteData = validationResult.data;

      // Validate photos
      const photoValidation = validatePhotos(files.length);
      
      // Validate each uploaded image
      const photoFilenames: string[] = [];
      const validationErrors: string[] = [];

      for (const file of files) {
        const validation = await imageService.validateImage(file.path);
        if (validation.isValid) {
          photoFilenames.push(file.filename);
        } else {
          validationErrors.push(...validation.errors);
          await imageService.deleteImage(file.filename);
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: "Photo validation failed",
          errors: validationErrors
        });
      }

      // Get current settings for calculation
      const settings = await storage.getSettings();
      const rates = {
        labourRate: settings.labourRate,
        materialsPerPanel: settings.materialsPerPanel,
        partsMarkup: settings.partsMarkup,
        metallicMultiplier: settings.metallicMultiplier,
        pearlescentMultiplier: settings.pearlescentMultiplier,
        minJob: settings.minJob
      };

      // Calculate quote
      const calculation = calculateQuote(
        quoteData.items,
        quoteData.vehiclePaint,
        rates,
        photoValidation.isValid
      );

      // Create quote
      const quote = await storage.createQuote({
        ...quoteData,
        itemsJson: JSON.stringify(quoteData.items),
        ratesJson: JSON.stringify(rates),
        calcJson: JSON.stringify(calculation),
        photos: photoFilenames
      });

      // Send confirmation email
      const emailService = new EmailService(settings);
      if (emailService.isConfigured()) {
        await emailService.sendQuoteSubmissionConfirmation(
          quote.customerEmail,
          quote.customerName,
          quote.id
        );
      }

      res.status(201).json({
        message: "Quote submitted successfully",
        quoteId: quote.id,
        status: quote.status,
        photoValidation: photoValidation,
        emailSent: emailService.isConfigured()
      });

    } catch (error) {
      console.error('Quote submission error:', error);
      res.status(500).json({ message: "Failed to submit quote" });
    }
  });

  // Get quote (owner only)
  app.get('/api/quote/:id', requireOwnerSession, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const statusHistory = await storage.getQuoteStatusHistory(quote.id);
      
      res.json({
        ...quote,
        items: safeJsonParse(quote.itemsJson, []),
        rates: safeJsonParse(quote.ratesJson, {}),
        calculation: safeJsonParse(quote.calcJson, null),
        photos: safeJsonParse(quote.photosJson, []),
        statusHistory
      });
    } catch (error) {
      console.error('Get quote error:', error);
      res.status(500).json({ message: "Failed to get quote" });
    }
  });

  // Update quote (owner only)
  app.patch('/api/quote/:id', requireOwnerSession, async (req, res) => {
    try {
      const { items, rates, ownerNotes } = req.body;
      
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      let updates: any = {};

      if (ownerNotes !== undefined) {
        updates.ownerNotes = ownerNotes;
      }

      if (items && rates) {
        // Recalculate with new items/rates
        const calculation = calculateQuote(
          items,
          quote.vehiclePaint,
          rates,
          true // Assume photos are valid for owner updates
        );

        updates.itemsJson = JSON.stringify(items);
        updates.ratesJson = JSON.stringify(rates);
        updates.calcJson = JSON.stringify(calculation);
      }

      const updatedQuote = await storage.updateQuote(req.params.id, updates);
      res.json(updatedQuote);

    } catch (error) {
      console.error('Update quote error:', error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  // Approve quote (owner only)
  app.post('/api/quote/:id/approve', requireOwnerSession, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      if (quote.status !== 'new') {
        return res.status(400).json({ message: "Quote already processed" });
      }

      // Update status to approved
      const updatedQuote = await storage.updateQuote(req.params.id, { status: 'approved' });
      await storage.addQuoteStatusHistory(req.params.id, 'approved', 'Quote approved by owner');

      // Generate PDF and send email
      const settings = await storage.getSettings();
      const emailService = new EmailService(settings);
      const calculation = safeJsonParse(quote.calcJson, null);

      const quoteUrl = `${settings.siteUrl}/q/${quote.customerLinkSlug}`;
      const pdfUrl = `${settings.siteUrl}/api/quote/${quote.id}/pdf`;

      if (emailService.isConfigured()) {
        const emailResult = await emailService.sendApprovedQuote(
          quote.customerEmail,
          quote.customerName,
          quoteUrl,
          pdfUrl,
          (calculation as any)?.totalIncGST || 0
        );

        if (emailResult.success) {
          await storage.updateQuote(req.params.id, { status: 'sent' });
          await storage.addQuoteStatusHistory(req.params.id, 'sent', 'Quote sent to customer');
        }
      }

      res.json({
        message: "Quote approved successfully",
        quote: updatedQuote,
        quoteUrl,
        pdfUrl,
        emailSent: emailService.isConfigured()
      });

    } catch (error) {
      console.error('Approve quote error:', error);
      res.status(500).json({ message: "Failed to approve quote" });
    }
  });

  // Get all quotes (owner only)
  app.get('/api/quotes', requireOwnerSession, async (req, res) => {
    try {
      const quotes = await storage.getAllQuotes();
      
      const quotesWithCalculations = quotes.map(quote => {
        return {
          ...quote,
          calculation: safeJsonParse(quote.calcJson, null),
          items: safeJsonParse(quote.itemsJson, [])
        };
      });

      res.json(quotesWithCalculations);
    } catch (error) {
      console.error('Get quotes error:', error);
      res.status(500).json({ message: "Failed to get quotes" });
    }
  });

  // Delete quote (owner only)
  app.delete('/api/quote/:id', requireOwnerSession, async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      // Delete associated photos
      if (quote.photosJson) {
        const photos = JSON.parse(quote.photosJson);
        for (const photo of photos) {
          await imageService.deleteImage(photo);
        }
      }

      const deleted = await storage.deleteQuote(req.params.id);
      if (deleted) {
        res.json({ message: "Quote deleted successfully" });
      } else {
        res.status(404).json({ message: "Quote not found" });
      }
    } catch (error) {
      console.error('Delete quote error:', error);
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Generate HTML preview (owner and public for approved quotes)
  app.get('/api/quote/:id/pdf', async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      // Check if quote is approved for public access
      if (quote.status !== 'approved' && quote.status !== 'sent') {
        if (!req.session?.isOwner) {
          return res.status(403).json({ message: "Quote not available" });
        }
      }

      const settings = await storage.getSettings();
      // Debug logging removed for security
      
      const pdfService = new PDFService(settings);
      
      const pdfBuffer = await pdfService.generatePDF(quote);
      const filename = pdfService.getQuoteFileName(quote);

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('HTML generation error:', error);
      res.status(500).json({ message: "Failed to generate HTML preview" });
    }
  });

  // Public quote view
  app.get('/q/:slug', async (req, res) => {
    try {
      const quote = await storage.getQuoteBySlug(req.params.slug);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      if (quote.status !== 'approved' && quote.status !== 'sent') {
        return res.status(403).json({ message: "Quote not available" });
      }

      // Only expose public-safe information, exclude sensitive owner data
      res.json({
        id: quote.id,
        status: quote.status,
        createdAt: quote.createdAt,
        customerName: quote.customerName,
        vehicleRego: quote.vehicleRego,
        vehicleMake: quote.vehicleMake,
        vehicleModel: quote.vehicleModel,
        vehicleYear: quote.vehicleYear,
        vehiclePaint: quote.vehiclePaint,
        items: JSON.parse(quote.itemsJson),
        calculation: JSON.parse(quote.calcJson),
        photos: quote.photosJson ? JSON.parse(quote.photosJson) : []
        // Explicitly exclude: ownerNotes, ratesJson, customerPhone, customerEmail for privacy
      });
    } catch (error) {
      console.error('Public quote error:', error);
      res.status(500).json({ message: "Failed to get quote" });
    }
  });

  // Owner authentication with 2FA support
  app.post('/api/owner/login', generalRateLimiter.middleware(), async (req, res) => {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request",
          errors: validationResult.error.errors
        });
      }

      const { pin } = validationResult.data;
      const settings = await storage.getSettings();
      
      // Use constant-time comparison to prevent timing attacks
      const isValidPin = isPinHashed(settings.ownerPin) 
        ? await comparePin(pin, settings.ownerPin)
        : pin === settings.ownerPin;
        
      if (!isValidPin) {
        return res.status(401).json({ message: "Invalid PIN" });
      }

      // PIN is valid - check if 2FA is enabled
      if (!settings.twoFaEnabled) {
        // 2FA disabled - complete login immediately (backwards compatibility)
        if (req.session) {
          req.session.regenerate((err) => {
            if (err) {
              console.error('Session regeneration error:', err);
              return res.status(500).json({ message: "Authentication error" });
            }
            
            req.session.isOwner = true;
            req.session.pending2FA = false;
            
            req.session.save((saveErr) => {
              if (saveErr) {
                console.error('Session save error:', saveErr);
                return res.status(500).json({ message: "Authentication error" });
              }
              
              res.json({ 
                message: "Authentication successful",
                requiresOTP: false 
              });
            });
          });
        } else {
          res.status(500).json({ message: "Session not available" });
        }
        return;
      }

      // 2FA is enabled - generate and send OTP
      if (!settings.twoFaEmail) {
        return res.status(400).json({ 
          message: "2FA is enabled but no email address is configured. Please contact administrator." 
        });
      }

      const emailService = new EmailService(settings);
      if (!emailService.isConfigured()) {
        return res.status(500).json({ 
          message: "Email service not configured. Please contact administrator." 
        });
      }

      // Generate OTP
      const otpData = await generateOTPRecord();
      
      // Store OTP in settings (hashed)
      await storage.updateSettings({
        otpSecret: otpData.hashedOtp,
        otpExpiresAt: otpData.expiresAt
      });

      // Send OTP email
      const emailResult = await emailService.sendOTPCode(
        settings.twoFaEmail,
        otpData.otp
      );

      if (!emailResult.success) {
        // Clear OTP data on email failure
        await storage.updateSettings(clearOTPData());
        return res.status(500).json({ 
          message: "Failed to send verification code. Please try again." 
        });
      }

      // Set pending 2FA session
      if (req.session) {
        req.session.regenerate((err) => {
          if (err) {
            console.error('Session regeneration error:', err);
            return res.status(500).json({ message: "Authentication error" });
          }
          
          req.session.isOwner = false;
          req.session.pending2FA = true;
          
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error('Session save error:', saveErr);
              return res.status(500).json({ message: "Authentication error" });
            }
            
            res.json({ 
              message: "Verification code sent to your email",
              requiresOTP: true,
              email: settings.twoFaEmail!.replace(/(.{2}).*@/, "$1***@") // Mask email for security
            });
          });
        });
      } else {
        res.status(500).json({ message: "Session not available" });
      }

    } catch (error) {
      console.error('Owner login error:', error);
      res.status(500).json({ message: "Authentication error" });
    }
  });

  // OTP verification endpoint
  app.post('/api/owner/verify-otp', generalRateLimiter.middleware(), requirePending2FA, async (req, res) => {
    try {
      // Validate request body
      const validationResult = otpVerificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid OTP format",
          errors: validationResult.error.errors
        });
      }

      const { otp } = validationResult.data;
      const settings = await storage.getSettings();

      // Check if OTP exists and hasn't expired
      if (!settings.otpSecret || !settings.otpExpiresAt) {
        return res.status(400).json({ 
          message: "No pending OTP verification. Please start the login process again." 
        });
      }

      if (isOTPExpired(settings.otpExpiresAt)) {
        // Clear expired OTP
        await storage.updateSettings(clearOTPData());
        return res.status(400).json({ 
          message: "OTP has expired. Please start the login process again." 
        });
      }

      // Verify OTP
      const isValidOTP = await verifyOTP(otp, settings.otpSecret);
      
      if (!isValidOTP) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // OTP is valid - complete authentication
      // Clear OTP data first (single use)
      await storage.updateSettings(clearOTPData());

      if (req.session) {
        req.session.isOwner = true;
        req.session.pending2FA = false;
        
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: "Authentication error" });
          }
          
          res.json({ 
            message: "Authentication successful"
          });
        });
      } else {
        res.status(500).json({ message: "Session not available" });
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: "Verification error" });
    }
  });

  // 2FA Settings endpoints
  app.get('/api/owner/2fa-settings', requireOwnerSession, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      
      res.json({
        twoFaEnabled: settings.twoFaEnabled,
        twoFaEmail: settings.twoFaEmail || "",
        hasEmailService: !!(settings.sendgridApiKey && settings.fromEmail)
      });
    } catch (error) {
      console.error('2FA settings get error:', error);
      res.status(500).json({ message: "Failed to get 2FA settings" });
    }
  });

  app.patch('/api/owner/2fa-settings', requireOwnerSession, generalRateLimiter.middleware(), async (req, res) => {
    try {
      // Validate request body
      const validationResult = twoFaSettingsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid 2FA settings",
          errors: validationResult.error.errors
        });
      }

      const { twoFaEnabled, twoFaEmail } = validationResult.data;
      const settings = await storage.getSettings();

      // Check if email service is properly configured when enabling 2FA
      if (twoFaEnabled) {
        if (!settings.sendgridApiKey) {
          return res.status(400).json({ 
            message: "SendGrid API key must be configured before enabling 2FA. Please add your SendGrid API key in settings." 
          });
        }
        
        if (!settings.fromEmail) {
          return res.status(400).json({ 
            message: "From email address must be configured before enabling 2FA. Please set a from email in settings." 
          });
        }

        // Verify email service is working by testing configuration
        try {
          const emailService = new EmailService(settings);
          if (!emailService.isConfigured()) {
            return res.status(400).json({ 
              message: "Email service configuration is invalid. Please check your SendGrid API key." 
            });
          }
        } catch (error) {
          console.error('Email service validation error:', error);
          return res.status(400).json({ 
            message: "Email service validation failed. Please verify your SendGrid configuration." 
          });
        }
      }

      // Update 2FA settings
      await storage.updateSettings({
        twoFaEnabled,
        twoFaEmail: twoFaEmail || null,
        // Clear any existing OTP data when changing settings
        ...clearOTPData()
      });

      res.json({ 
        message: `2FA ${twoFaEnabled ? 'enabled' : 'disabled'} successfully`,
        twoFaEnabled,
        twoFaEmail: twoFaEmail || ""
      });

    } catch (error) {
      console.error('2FA settings update error:', error);
      res.status(500).json({ message: "Failed to update 2FA settings" });
    }
  });

  app.post('/api/owner/logout', (req, res) => {
    if (req.session) {
      // Properly destroy the session to prevent session fixation
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: "Logout error" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid'); // Default session cookie name
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Logged out successfully" });
    }
  });

  // Session check (owner only)
  app.get('/api/owner/session', requireOwnerSession, (req, res) => {
    res.json({ 
      authenticated: true,
      message: "Valid owner session"
    });
  });

  // Settings management (owner only)
  app.get('/api/settings', requireOwnerSession, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      // Don't expose sensitive data in response
      const { ownerPin, sendgridApiKey, ...publicSettings } = settings;
      res.json(publicSettings);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.patch('/api/settings', requireOwnerSession, async (req, res) => {
    try {
      const validationResult = insertSettingsSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const updatedSettings = await storage.updateSettings(validationResult.data);
      const { ownerPin, sendgridApiKey, ...publicSettings } = updatedSettings;
      
      res.json(publicSettings);
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Marketing content management endpoints (owner only)
  // GET /api/content/marketing - Returns all YAML content for editing
  app.get('/api/content/marketing', requireOwnerSession, async (req, res) => {
    try {
      const yaml = await import('yaml');
      const contentPath = path.join(process.cwd(), 'content');
      
      // Load brand content
      let brand = {};
      try {
        const brandContent = await fs.readFile(path.join(contentPath, 'brand.yaml'), 'utf-8');
        brand = yaml.parse(brandContent);
      } catch (error) {
        console.error('Error reading brand.yaml:', error);
        return res.status(500).json({ message: "Failed to read brand content file" });
      }
      
      // Load home content
      let home = {};
      try {
        const homeContent = await fs.readFile(path.join(contentPath, 'home.yaml'), 'utf-8');
        home = yaml.parse(homeContent);
      } catch (error) {
        console.error('Error reading home.yaml:', error);
        return res.status(500).json({ message: "Failed to read home content file" });
      }
      
      // Load services content
      let services = {};
      try {
        const servicesContent = await fs.readFile(path.join(contentPath, 'services.yaml'), 'utf-8');
        services = yaml.parse(servicesContent);
      } catch (error) {
        console.error('Error reading services.yaml:', error);
        return res.status(500).json({ message: "Failed to read services content file" });
      }
      
      res.json({ brand, home, services });
    } catch (error) {
      console.error('Get marketing content error:', error);
      res.status(500).json({ message: "Failed to get marketing content" });
    }
  });

  // PUT /api/content/marketing - Updates YAML content files with validation
  app.put('/api/content/marketing', requireOwnerSession, async (req, res) => {
    try {
      // Validate request body
      const validationResult = marketingContentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const { brand, home, services } = validationResult.data;
      const yaml = await import('yaml');
      const contentPath = path.join(process.cwd(), 'content');

      // Update brand.yaml
      try {
        const brandYaml = yaml.stringify(brand, { 
          indent: 2,
          lineWidth: 0 // Prevent line wrapping
        });
        await fs.writeFile(path.join(contentPath, 'brand.yaml'), brandYaml, 'utf-8');
      } catch (error) {
        console.error('Error writing brand.yaml:', error);
        return res.status(500).json({ message: "Failed to update brand content file" });
      }

      // Update home.yaml
      try {
        const homeYaml = yaml.stringify(home, { 
          indent: 2,
          lineWidth: 0
        });
        await fs.writeFile(path.join(contentPath, 'home.yaml'), homeYaml, 'utf-8');
      } catch (error) {
        console.error('Error writing home.yaml:', error);
        return res.status(500).json({ message: "Failed to update home content file" });
      }

      // Update services.yaml
      try {
        const servicesYaml = yaml.stringify(services, { 
          indent: 2,
          lineWidth: 0
        });
        await fs.writeFile(path.join(contentPath, 'services.yaml'), servicesYaml, 'utf-8');
      } catch (error) {
        console.error('Error writing services.yaml:', error);
        return res.status(500).json({ message: "Failed to update services content file" });
      }

      res.json({ 
        message: "Marketing content updated successfully",
        updatedFiles: ['brand.yaml', 'home.yaml', 'services.yaml']
      });
    } catch (error) {
      console.error('Update marketing content error:', error);
      res.status(500).json({ message: "Failed to update marketing content" });
    }
  });

  // First-time PIN change (unauthenticated, for fresh installations)
  app.post('/api/owner/first-time-pin-change', pinChangeRateLimiter.middleware(), async (req, res) => {
    try {
      const settings = await storage.getSettings();
      
      // Only allow first-time PIN change if using default PIN
      if (!settings.isDefaultPin) {
        return res.status(403).json({ 
          message: "First-time PIN change is only allowed for fresh installations with default PIN",
          requiresNormalPinChange: true 
        });
      }

      // Validate request body using strong PIN requirements
      const validationResult = firstTimePinChangeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "PIN validation failed",
          errors: validationResult.error.errors
        });
      }

      const { newPin } = validationResult.data;
      
      // Ensure new PIN is different from default PIN
      if (newPin === settings.ownerPin) {
        return res.status(400).json({ 
          message: "New PIN must be different from the default PIN" 
        });
      }

      // Hash the new PIN before storage
      const hashedPin = await hashPin(newPin);
      
      // Update PIN and mark as no longer default
      await storage.updateSettings({ 
        ownerPin: hashedPin, 
        isDefaultPin: false 
      });

      res.json({ 
        message: "PIN changed successfully. You can now access owner features.",
        success: true 
      });

    } catch (error) {
      console.error('First-time PIN change error:', error);
      res.status(500).json({ message: "Failed to change PIN" });
    }
  });

  // Change owner PIN (requires current PIN and owner session)
  app.post('/api/owner/change-pin', requireOwnerSession, pinChangeRateLimiter.middleware(), async (req, res) => {
    try {
      // Validate request body using strong PIN requirements
      const validationResult = pinChangeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "PIN validation failed",
          errors: validationResult.error.errors
        });
      }

      const { currentPin, newPin } = validationResult.data;
      const settings = await storage.getSettings();
      
      // Verify current PIN using constant-time comparison
      const isValidPin = isPinHashed(settings.ownerPin) 
        ? await comparePin(currentPin, settings.ownerPin)
        : currentPin === settings.ownerPin;
        
      if (!isValidPin) {
        return res.status(401).json({ message: "Current PIN is incorrect" });
      }

      // Hash the new PIN before storage
      const hashedPin = await hashPin(newPin);
      
      // Update PIN and ensure isDefaultPin is set to false
      await storage.updateSettings({ 
        ownerPin: hashedPin, 
        isDefaultPin: false 
      });

      res.json({ 
        message: "PIN changed successfully",
        success: true 
      });

    } catch (error) {
      console.error('Change PIN error:', error);
      res.status(500).json({ message: "Failed to change PIN" });
    }
  });

  // Analytics (owner only)
  app.get('/api/analytics', requireOwnerSession, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Testimonials
  app.post('/api/testimonial', async (req, res) => {
    try {
      const validationResult = insertTestimonialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const testimonial = await storage.createTestimonial(validationResult.data);
      res.status(201).json(testimonial);

    } catch (error) {
      console.error('Testimonial error:', error);
      res.status(500).json({ message: "Failed to submit testimonial" });
    }
  });

  app.get('/api/testimonials', requireOwnerSession, async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error('Get testimonials error:', error);
      res.status(500).json({ message: "Failed to get testimonials" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Page } from "@shared/schema";
import { 
  ExternalLink, 
  ArrowRight, 
  Star, 
  Quote,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface PageContent {
  blocks: ContentBlock[];
  seo?: {
    title?: string;
    description?: string;
  };
}

interface ContentBlock {
  type: 'hero' | 'text' | 'image' | 'cta' | 'testimonial' | 'product' | 'contact';
  [key: string]: any;
}

export default function DynamicPage() {
  const { slug } = useParams();
  
  const { data: page, isLoading, error } = useQuery<Page>({
    queryKey: ['/api/pages', slug],
    enabled: !!slug,
  });

  // Set page title and meta tags
  useEffect(() => {
    if (page) {
      try {
        const content: PageContent = JSON.parse(page.content);
        const title = content.seo?.title || page.seoTitle || page.title;
        const description = content.seo?.description || page.seoDescription;
        
        document.title = title;
        
        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        if (description) {
          metaDescription.setAttribute('content', description);
        }
        
        // Update Open Graph tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
          ogTitle = document.createElement('meta');
          ogTitle.setAttribute('property', 'og:title');
          document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', title);
        
        if (description) {
          let ogDescription = document.querySelector('meta[property="og:description"]');
          if (!ogDescription) {
            ogDescription = document.createElement('meta');
            ogDescription.setAttribute('property', 'og:description');
            document.head.appendChild(ogDescription);
          }
          ogDescription.setAttribute('content', description);
        }
        
      } catch (error) {
        console.error('Error parsing page content:', error);
        document.title = page.title;
      }
    }
  }, [page]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-8">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert variant="destructive">
            <AlertDescription>
              <div className="text-center space-y-4">
                <h2 className="text-lg font-semibold">Page Not Found</h2>
                <p>The page you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check if page is published
  if (page.status !== 'published') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert>
            <AlertDescription>
              <div className="text-center space-y-4">
                <h2 className="text-lg font-semibold">Page Not Available</h2>
                <p>This page is currently in draft mode and not publicly accessible.</p>
                <Button onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  let content: PageContent;
  try {
    content = JSON.parse(page.content);
  } catch (error) {
    console.error('Error parsing page content:', error);
    content = { blocks: [] };
  }

  return (
    <div className="min-h-screen bg-background" data-testid="dynamic-page">
      {/* Render content blocks */}
      <div className="space-y-0">
        {content.blocks.map((block, index) => (
          <ContentBlockRenderer 
            key={index} 
            block={block} 
            data-testid={`content-block-${block.type}-${index}`}
          />
        ))}
      </div>
      
      {/* Fallback content if no blocks */}
      {content.blocks.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">{page.title}</h1>
            <p className="text-muted-foreground">
              This page is under construction. Content will be added soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Content Block Renderer Component
interface ContentBlockRendererProps {
  block: ContentBlock;
  'data-testid'?: string;
}

function ContentBlockRenderer({ block, ...props }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} {...props} />;
    case 'text':
      return <TextBlock block={block} {...props} />;
    case 'image':
      return <ImageBlock block={block} {...props} />;
    case 'cta':
      return <CTABlock block={block} {...props} />;
    case 'testimonial':
      return <TestimonialBlock block={block} {...props} />;
    case 'product':
      return <ProductBlock block={block} {...props} />;
    case 'contact':
      return <ContactBlock block={block} {...props} />;
    default:
      console.warn(`Unknown block type encountered: ${block.type}. Skipping render.`);
      return null;
  }
}

// Hero Block Component
function HeroBlock({ block, ...props }: ContentBlockRendererProps) {
  const { title, subtitle, description, buttons = [], backgroundImage } = block;
  
  return (
    <section 
      className={`relative py-20 lg:py-32 ${backgroundImage ? 'bg-cover bg-center' : 'bg-gradient-to-br from-primary/5 to-secondary/5'}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      {...props}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {title && (
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <h2 className={`text-xl md:text-2xl mb-6 ${backgroundImage ? 'text-white/90' : 'text-muted-foreground'}`}>
              {subtitle}
            </h2>
          )}
          {description && (
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${backgroundImage ? 'text-white/80' : 'text-muted-foreground'}`}>
              {description}
            </p>
          )}
          {buttons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {buttons.map((button: any, index: number) => (
                <Button
                  key={index}
                  variant={button.variant || 'default'}
                  size="lg"
                  onClick={() => button.link && window.open(button.link, button.target || '_self')}
                  data-testid={`hero-button-${index}`}
                >
                  {button.text}
                  {button.icon && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Text Block Component
function TextBlock({ block, ...props }: ContentBlockRendererProps) {
  const { content, alignment = 'left', maxWidth = 'max-w-4xl' } = block;
  
  return (
    <section className="py-16" {...props}>
      <div className={`mx-auto px-4 ${maxWidth}`}>
        <div 
          className={`prose prose-lg max-w-none ${alignment === 'center' ? 'text-center mx-auto' : ''}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}

// Image Block Component
function ImageBlock({ block, ...props }: ContentBlockRendererProps) {
  const { src, alt, caption, width = 'full' } = block;
  
  return (
    <section className="py-16" {...props}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`${width === 'full' ? 'w-full' : 'max-w-2xl mx-auto'}`}>
          <img 
            src={src} 
            alt={alt || ''} 
            className="w-full h-auto rounded-lg shadow-lg"
            loading="lazy"
          />
          {caption && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              {caption}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// CTA Block Component
function CTABlock({ block, ...props }: ContentBlockRendererProps) {
  const { title, description, button, backgroundColor = 'bg-primary/5' } = block;
  
  return (
    <section className={`py-20 ${backgroundColor}`} {...props}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        {button && (
          <Button
            size="lg"
            variant={button.variant || 'default'}
            onClick={() => button.link && window.open(button.link, button.target || '_self')}
            data-testid="cta-button"
          >
            {button.text}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </section>
  );
}

// Testimonial Block Component
function TestimonialBlock({ block, ...props }: ContentBlockRendererProps) {
  const { testimonials = [], title } = block;
  
  return (
    <section className="py-20 bg-muted/30" {...props}>
      <div className="max-w-6xl mx-auto px-4">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
            {title}
          </h2>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < (testimonial.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-primary mb-4" />
                <p className="text-muted-foreground mb-6">
                  {testimonial.content}
                </p>
                <div className="flex items-center">
                  {testimonial.avatar && (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="h-10 w-10 rounded-full mr-3"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    {testimonial.title && (
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Product Block Component
function ProductBlock({ block, ...props }: ContentBlockRendererProps) {
  const { title, products = [] } = block;
  
  return (
    <section className="py-20" {...props}>
      <div className="max-w-6xl mx-auto px-4">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
            {title}
          </h2>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product: any, index: number) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              {product.image && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                  {product.badge && (
                    <Badge variant="secondary">{product.badge}</Badge>
                  )}
                </div>
                {product.description && (
                  <p className="text-muted-foreground mb-4">{product.description}</p>
                )}
                <div className="flex items-center justify-between">
                  {product.price && (
                    <span className="text-2xl font-bold text-primary">{product.price}</span>
                  )}
                  {product.link && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(product.link, '_blank')}
                      data-testid={`product-button-${index}`}
                    >
                      Learn More
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Contact Block Component
function ContactBlock({ block, ...props }: ContentBlockRendererProps) {
  const { title, description, contactInfo = {} } = block;
  
  return (
    <section className="py-20 bg-muted/30" {...props}>
      <div className="max-w-4xl mx-auto px-4">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-6">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {contactInfo.email && (
            <div className="space-y-4">
              <Mail className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-foreground">Email</h3>
              <p className="text-muted-foreground">{contactInfo.email}</p>
            </div>
          )}
          {contactInfo.phone && (
            <div className="space-y-4">
              <Phone className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-foreground">Phone</h3>
              <p className="text-muted-foreground">{contactInfo.phone}</p>
            </div>
          )}
          {contactInfo.address && (
            <div className="space-y-4">
              <MapPin className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold text-foreground">Address</h3>
              <p className="text-muted-foreground">{contactInfo.address}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
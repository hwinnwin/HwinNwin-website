import { useQuery } from "@tanstack/react-query";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { getAllBlogPosts } from "@/lib/contentLoader";
import { ArrowRight, Calendar, User } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";

export default function BlogPage() {
  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getAllBlogPosts,
  });

  if (isLoading) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gold">Loading insights...</div>
        </div>
      </MarketingLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MarketingLayout>
      {/* SEO */}
      <SeoHead 
        title="Insights & Ideas - Business Strategy Blog | HwinNwin"
        description="Practical business wisdom for scaling your company. Short insights with real impact from Melbourne's leading business consultants. Structure, mindset, excellence."
        ogTitle="Business Insights & Strategy Blog | HwinNwin"
        ogDescription="Practical wisdom for scaling your business. Short insights. Real impact. Business strategy and consulting advice from Melbourne experts."
        canonicalUrl={`${SITE_CONFIG.baseUrl}/hwin/insights`}
        keywords={['business insights', 'strategy blog', 'consulting advice', 'scaling business', 'Melbourne business', 'practical wisdom']}
      />
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20" data-testid="blog-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid="blog-headline">
              Insights & Ideas
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="blog-subtitle">
              Practical wisdom for scaling your business. Short insights. Real impact.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 lg:py-24" data-testid="blog-posts-grid">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {blogPosts?.map((post, index) => (
              <Card key={index} className="hover:shadow-soft transition-shadow group" data-testid={`blog-post-card-${index}`}>
                <CardHeader>
                  <div className="space-y-3">
                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span data-testid={`post-date-${index}`}>
                          {formatDate(post.frontmatter.date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span data-testid={`post-author-${index}`}>
                          {post.frontmatter.author}
                        </span>
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl text-charcoal dark:text-hwin-white group-hover:text-gold transition-colors">
                      {post.frontmatter.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground line-clamp-3" data-testid={`post-description-${index}`}>
                    {post.frontmatter.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2" data-testid={`post-tags-${index}`}>
                    {post.frontmatter.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full group-hover:bg-gold group-hover:text-charcoal transition-colors"
                    data-testid={`blog-post-link-${index}`}
                  >
                    <Link href={`/hwin/insights/${post.frontmatter.slug}`}>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )) || []}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="newsletter-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white">
              Stay Updated
            </h2>
            <p className="text-lg text-muted-foreground">
              Get practical insights delivered to your inbox. No fluff. Just actionable wisdom.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
              data-testid="newsletter-cta"
            >
              <Link href="/hwin/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
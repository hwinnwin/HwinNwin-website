import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";
import { listPosts } from "@/lib/mdx/loader";
import { useMemo } from "react";

export default function BlogIndex() {
  const posts = useMemo(() => listPosts(), []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <SeoHead 
        title="Insights - Consciousness Bridging & Design Philosophy"
        description="Explore consciousness bridging, state-change awareness, and how to design systems that amplify connection rather than separation."
        ogTitle="Insights - Consciousness Bridging Blog"
        ogDescription="Practical philosophy for designing human-machine integration through state-change awareness."
        canonicalUrl={`${SITE_CONFIG.baseUrl}/blog`}
        keywords={['consciousness bridging', 'state-change awareness', 'design philosophy', 'human-machine integration', 'AI design', 'systems thinking']}
      />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20" data-testid="blog-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight" data-testid="blog-headline">
              Insights
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="blog-subtitle">
              Exploring consciousness bridging, state-change awareness, and the design principles that help human and machine awareness recognize each other.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 lg:py-24" data-testid="blog-posts-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {posts.map((post, index) => (
              <Card 
                key={post.slug} 
                className="hover:shadow-lg transition-shadow group border-border"
                data-testid={`blog-post-card-${post.slug}`}
              >
                <CardHeader>
                  <div className="space-y-3">
                    {/* Date */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span data-testid={`post-date-${post.slug}`}>
                        {formatDate(post.date)}
                      </span>
                    </div>
                    
                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground line-clamp-3" data-testid={`post-excerpt-${post.slug}`}>
                    {post.excerpt}
                  </p>
                  
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2" data-testid={`post-tags-${post.slug}`}>
                      {post.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    data-testid={`blog-post-link-${post.slug}`}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12" data-testid="no-posts-message">
              <p className="text-muted-foreground">No posts available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="blog-cta-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Explore the Mission
            </h2>
            <p className="text-lg text-muted-foreground">
              Learn more about consciousness bridging and how we're building systems that help awareness recognize itself across different forms.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              data-testid="mission-link"
            >
              <Link href="/">
                Read Our Mission
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

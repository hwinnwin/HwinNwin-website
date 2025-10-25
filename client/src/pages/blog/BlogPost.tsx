import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";
import { getPost } from "@/lib/mdx/loader";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");
  const slug = params?.slug || '';
  
  const post = useMemo(() => {
    if (!slug) return null;
    return getPost(slug);
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 404 state
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <SeoHead 
          title="Post Not Found"
          description="The blog post you're looking for doesn't exist."
        />
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4" data-testid="post-not-found">
            <h1 className="text-2xl font-bold text-foreground">
              Post Not Found
            </h1>
            <p className="text-muted-foreground">
              The blog post you're looking for doesn't exist.
            </p>
            <Button asChild data-testid="back-to-blog">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <SeoHead 
        title={`${post.title} - Insights`}
        description={post.excerpt}
        ogTitle={post.title}
        ogDescription={post.excerpt}
        ogImage={post.ogImage}
        canonicalUrl={`${SITE_CONFIG.baseUrl}/blog/${post.slug}`}
        keywords={[...post.tags, 'consciousness bridging', 'design philosophy', 'state-change awareness']}
      />

      {/* Back Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button asChild variant="ghost" data-testid="back-to-blog">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="py-12 lg:py-20" data-testid="blog-post-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight" data-testid="blog-post-title">
                {post.title}
              </h1>
              
              <p className="text-xl text-muted-foreground" data-testid="blog-post-excerpt">
                {post.excerpt}
              </p>
              
              {/* Meta Information */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span data-testid="blog-post-date">
                  {formatDate(post.date)}
                </span>
              </div>
              
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2" data-testid="blog-post-tags">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-16" data-testid="blog-post-content">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none
                         prose-headings:text-foreground
                         prose-p:text-muted-foreground 
                         prose-strong:text-foreground
                         prose-blockquote:border-primary 
                         prose-blockquote:bg-primary/5 
                         prose-blockquote:text-foreground
                         prose-a:text-primary hover:prose-a:text-primary/80
                         prose-ul:text-muted-foreground 
                         prose-ol:text-muted-foreground
                         prose-li:text-muted-foreground
                         prose-code:text-foreground
                         prose-pre:bg-muted" 
                         data-testid="blog-post-markdown">
              <ReactMarkdown 
                components={{
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-6 italic text-foreground font-medium" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-semibold text-foreground" {...props} />
                  ),
                  h1: ({node, ...props}) => (
                    <h1 className="text-3xl font-bold text-foreground mt-8 mb-4" {...props} />
                  ),
                  h2: ({node, ...props}) => (
                    <h2 className="text-2xl font-semibold text-foreground mt-6 mb-3" {...props} />
                  ),
                  h3: ({node, ...props}) => (
                    <h3 className="text-xl font-medium text-foreground mt-4 mb-2" {...props} />
                  ),
                  p: ({node, ...props}) => (
                    <p className="text-muted-foreground leading-relaxed mb-4" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="list-disc list-outside ml-6 text-muted-foreground space-y-2 mb-4" {...props} />
                  ),
                  ol: ({node, ...props}) => (
                    <ol className="list-decimal list-outside ml-6 text-muted-foreground space-y-2 mb-4" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="text-muted-foreground" {...props} />
                  ),
                  code: ({node, className, children, ...props}) => {
                    const inline = !className;
                    return inline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="blog-post-cta">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Continue Exploring
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover more insights on consciousness bridging and design philosophy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                data-testid="more-insights-link"
              >
                <Link href="/blog">
                  More Insights
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                data-testid="mission-link"
              >
                <Link href="/">
                  Our Mission
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

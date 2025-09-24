import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { loadBlogPost } from "@/lib/contentLoader";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage() {
  const [match, params] = useRoute("/hwin/insights/:slug");
  const slug = params?.slug;

  const { data: blogPostData, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => loadBlogPost(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gold">Loading article...</div>
        </div>
      </MarketingLayout>
    );
  }

  if (error || !blogPostData) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-charcoal dark:text-hwin-white">
              Article Not Found
            </h1>
            <p className="text-muted-foreground">
              The article you're looking for doesn't exist.
            </p>
            <Button asChild data-testid="back-to-blog">
              <Link href="/hwin/insights">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Insights
              </Link>
            </Button>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  const { frontmatter, content } = blogPostData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <MarketingLayout>
      {/* Back Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button asChild variant="ghost" data-testid="back-navigation">
          <Link href="/hwin/insights">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Insights
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="py-12 lg:py-20" data-testid="blog-post-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid="blog-post-title">
                {frontmatter.title}
              </h1>
              
              <p className="text-xl text-muted-foreground" data-testid="blog-post-description">
                {frontmatter.description}
              </p>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="blog-post-date">
                    {formatDate(frontmatter.date)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span data-testid="blog-post-author">
                    {frontmatter.author}
                  </span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2" data-testid="blog-post-tags">
                {frontmatter.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-16" data-testid="blog-post-content">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none
                         prose-headings:text-charcoal dark:prose-headings:text-hwin-white
                         prose-p:text-muted-foreground prose-strong:text-charcoal dark:prose-strong:text-hwin-white
                         prose-blockquote:border-gold prose-blockquote:bg-gold/5 prose-blockquote:text-gold
                         prose-a:text-gold hover:prose-a:text-gold/80
                         prose-ul:text-muted-foreground prose-ol:text-muted-foreground" 
                         data-testid="blog-post-text">
              <ReactMarkdown 
                components={{
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-gold bg-gold/5 pl-4 py-2 my-6 italic text-gold font-medium" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-semibold text-charcoal dark:text-hwin-white" {...props} />
                  ),
                  h1: ({node, ...props}) => (
                    <h1 className="text-3xl font-bold text-charcoal dark:text-hwin-white mt-8 mb-4" {...props} />
                  ),
                  h2: ({node, ...props}) => (
                    <h2 className="text-2xl font-semibold text-charcoal dark:text-hwin-white mt-6 mb-3" {...props} />
                  ),
                  h3: ({node, ...props}) => (
                    <h3 className="text-xl font-medium text-charcoal dark:text-hwin-white mt-4 mb-2" {...props} />
                  ),
                  p: ({node, ...props}) => (
                    <p className="text-muted-foreground leading-relaxed mb-4" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4" {...props} />
                  ),
                  ol: ({node, ...props}) => (
                    <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-4" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="text-muted-foreground" {...props} />
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="blog-post-cta-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white">
              Found This Helpful?
            </h2>
            <p className="text-lg text-muted-foreground">
              Let's discuss how these insights can be applied to your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
                data-testid="blog-post-contact-cta"
              >
                <Link href="/hwin/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                data-testid="view-more-insights"
              >
                <Link href="/hwin/insights">
                  More Insights
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import MarketingLayout from "@/components/layout/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { loadCaseStudy } from "@/lib/contentLoader";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_CONFIG } from "@/lib/constants";

export default function CaseStudyPage() {
  const [match, params] = useRoute("/hwin/work/:slug");
  const slug = params?.slug;

  const { data: caseStudyData, isLoading, error } = useQuery({
    queryKey: ["case-study", slug],
    queryFn: () => loadCaseStudy(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gold">Loading case study...</div>
        </div>
      </MarketingLayout>
    );
  }

  if (error || !caseStudyData) {
    return (
      <MarketingLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-charcoal dark:text-hwin-white">
              Case Study Not Found
            </h1>
            <p className="text-muted-foreground">
              The case study you're looking for doesn't exist.
            </p>
            <Button asChild data-testid="back-to-case-studies">
              <Link href="/hwin/work">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Case Studies
              </Link>
            </Button>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  const { frontmatter, content } = caseStudyData;

  return (
    <MarketingLayout>
      {/* Dynamic SEO */}
      <SeoHead 
        title={`${frontmatter.title} - ${frontmatter.client} Case Study | HwinNwin`}
        description={`Discover how HwinNwin helped ${frontmatter.client} achieve ${frontmatter.results[0] || 'significant business improvements'}. Case study with real results and implementation details.`}
        ogTitle={`${frontmatter.title} - ${frontmatter.client} Success Story`}
        ogDescription={`See how we helped ${frontmatter.client}: ${frontmatter.results.slice(0, 2).join(', ')}`}
        canonicalUrl={`${SITE_CONFIG.baseUrl}/hwin/work/${slug}`}
        keywords={[...(frontmatter.stack || []), frontmatter.client, 'case study', 'business results', 'implementation']}
      />
      {/* Back Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button asChild variant="ghost" data-testid="back-navigation">
          <Link href="/hwin/work">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Case Studies
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="py-12 lg:py-20" data-testid="case-study-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20" data-testid="client-name">
                {frontmatter.client}
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-charcoal dark:text-hwin-white leading-tight" data-testid="case-study-title">
                {frontmatter.title}
              </h1>
            </div>

            {/* Technology Stack */}
            <div className="space-y-3" data-testid="technology-stack">
              <h3 className="text-lg font-semibold text-charcoal dark:text-hwin-white">
                Technology Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {frontmatter.stack.map((tech, index) => (
                  <Badge key={index} variant="outline" data-testid={`tech-${index}`}>
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Key Results */}
            <div className="bg-muted/20 rounded-2xl p-8 space-y-4" data-testid="key-results">
              <h3 className="text-lg font-semibold text-charcoal dark:text-hwin-white">
                Key Results Achieved
              </h3>
              <ul className="space-y-3">
                {frontmatter.results.map((result, index) => (
                  <li key={index} className="flex items-start space-x-3" data-testid={`result-${index}`}>
                    <span className="text-gold font-bold">●</span>
                    <span className="text-muted-foreground">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-16" data-testid="case-study-content">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none
                         prose-headings:text-charcoal dark:prose-headings:text-hwin-white
                         prose-p:text-muted-foreground prose-strong:text-charcoal dark:prose-strong:text-hwin-white
                         prose-blockquote:border-gold prose-blockquote:bg-gold/5 prose-blockquote:text-gold
                         prose-a:text-gold hover:prose-a:text-gold/80
                         prose-ul:text-muted-foreground prose-ol:text-muted-foreground" 
                         data-testid="case-study-text">
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
      <section className="py-16 lg:py-24 bg-muted/20" data-testid="case-study-cta-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-charcoal dark:text-hwin-white">
              Inspired by This Success Story?
            </h2>
            <p className="text-lg text-muted-foreground">
              Let's discuss how we can achieve similar results for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gold hover:bg-gold/90 text-charcoal font-medium shadow-soft border-0"
                data-testid="case-study-contact-cta"
              >
                <Link href="/hwin/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                data-testid="view-more-case-studies"
              >
                <Link href="/hwin/work">
                  View More Case Studies
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}